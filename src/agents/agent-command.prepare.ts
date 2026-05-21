import {
  formatThinkingLevels,
  normalizeThinkLevel,
  normalizeVerboseLevel,
} from "../auto-reply/thinking.js";
import { formatCliCommand } from "../cli/command-format.js";
import { buildOutboundSessionContext } from "../infra/outbound/session-context.js";
import { loadManifestMetadataSnapshot } from "../plugins/manifest-contract-eligibility.js";
import {
  normalizeAgentId,
  resolveAgentIdFromSessionKey,
} from "../routing/session-key.js";
import type { RuntimeEnv } from "../runtime.js";
import { normalizeOptionalString } from "../shared/string-coerce.js";
import { resolveUserPath } from "../utils.js";
import { resolveAgentRuntimeConfig } from "./agent-runtime-config.js";
import {
  listAgentIds,
  resolveAgentDir,
  resolveAgentWorkspaceDir,
  resolveSessionAgentId,
} from "./agent-scope.js";
import {
  prependInternalEventContext,
  resolveAcpPromptBody,
  resolveInternalEventTranscriptBody,
} from "./command/attempt-execution.shared.js";
import { resolveSession } from "./command/session.js";
import type { AgentCommandOpts } from "./command/types.js";
import { DEFAULT_MODEL, DEFAULT_PROVIDER } from "./defaults.js";
import { AGENT_LANE_SUBAGENT } from "./lanes.js";
import {
  buildConfiguredModelCatalog,
  resolveConfiguredModelRef,
} from "./model-selection.js";
import type { ModelManifestNormalizationContext } from "./model-selection-normalize.js";
import { normalizeSpawnedRunMetadata } from "./spawned-context.js";
import { resolveAgentTimeoutMs } from "./timeout.js";
import { ensureAgentWorkspace } from "./workspace.js";
import { loadAcpManagerRuntime } from "./agent-command.loaders.js";

export async function prepareAgentCommandExecution(opts: AgentCommandOpts, runtime: RuntimeEnv) {
  const isRawModelRun = opts.modelRun === true || opts.promptMode === "none";
  const message = opts.message ?? "";
  if (!message.trim()) {
    throw new Error("Message (--message) is required");
  }
  if (!opts.to && !opts.sessionId && !opts.sessionKey && !opts.agentId) {
    throw new Error("Pass --to <E.164>, --session-id, or --agent to choose a session");
  }

  const { cfg } = await resolveAgentRuntimeConfig(runtime, {
    runtimeTargetsChannelSecrets: opts.deliver === true,
  });
  const normalizedSpawned = normalizeSpawnedRunMetadata({
    spawnedBy: opts.spawnedBy,
    groupId: opts.groupId,
    groupChannel: opts.groupChannel,
    groupSpace: opts.groupSpace,
    workspaceDir: opts.workspaceDir,
  });
  const agentIdOverrideRaw = opts.agentId?.trim();
  const agentIdOverride = agentIdOverrideRaw ? normalizeAgentId(agentIdOverrideRaw) : undefined;
  if (agentIdOverride) {
    const knownAgents = listAgentIds(cfg);
    if (!knownAgents.includes(agentIdOverride)) {
      throw new Error(
        `Unknown agent id "${agentIdOverrideRaw}". Use "${formatCliCommand("openclaw agents list")}" to see configured agents.`,
      );
    }
  }
  if (agentIdOverride && opts.sessionKey) {
    const sessionAgentId = resolveAgentIdFromSessionKey(opts.sessionKey);
    if (sessionAgentId !== agentIdOverride) {
      throw new Error(
        `Agent id "${agentIdOverrideRaw}" does not match session key agent "${sessionAgentId}".`,
      );
    }
  }
  const agentCfg = cfg.agents?.defaults;

  const verboseOverride = normalizeVerboseLevel(opts.verbose);
  if (opts.verbose && !verboseOverride) {
    throw new Error('Invalid verbose level. Use "on", "full", or "off".');
  }

  const laneRaw = normalizeOptionalString(opts.lane) ?? "";
  const subagentLane: string = AGENT_LANE_SUBAGENT;
  const isSubagentLane = laneRaw === subagentLane;
  const timeoutSecondsRaw =
    opts.timeout !== undefined ? Number.parseInt(opts.timeout, 10) : isSubagentLane ? 0 : undefined;
  if (
    timeoutSecondsRaw !== undefined &&
    (Number.isNaN(timeoutSecondsRaw) || timeoutSecondsRaw < 0)
  ) {
    throw new Error("--timeout must be a non-negative integer (seconds; 0 means no timeout)");
  }
  const timeoutMs = resolveAgentTimeoutMs({
    cfg,
    overrideSeconds: timeoutSecondsRaw,
  });

  const sessionResolution = resolveSession({
    cfg,
    to: opts.to,
    sessionId: opts.sessionId,
    sessionKey: opts.sessionKey,
    agentId: agentIdOverride,
  });

  const {
    sessionId,
    sessionKey,
    sessionEntry: sessionEntryRaw,
    sessionStore,
    storePath,
    isNewSession,
    persistedThinking,
    persistedVerbose,
  } = sessionResolution;
  const sessionAgentId =
    agentIdOverride ??
    resolveSessionAgentId({
      sessionKey: sessionKey ?? opts.sessionKey?.trim(),
      config: cfg,
    });
  const outboundSession = buildOutboundSessionContext({
    cfg,
    agentId: sessionAgentId,
    sessionKey,
  });
  const workspaceDirRaw =
    normalizedSpawned.workspaceDir ?? resolveAgentWorkspaceDir(cfg, sessionAgentId);
  const workspaceDir = resolveUserPath(workspaceDirRaw);
  const agentDir = resolveAgentDir(cfg, sessionAgentId);
  const manifestMetadataSnapshot = loadManifestMetadataSnapshot({
    config: cfg,
    workspaceDir,
    env: process.env,
  });
  const modelManifestContext = {
    manifestPlugins: manifestMetadataSnapshot.plugins,
  } satisfies ModelManifestNormalizationContext;
  const configuredModel = resolveConfiguredModelRef({
    cfg,
    defaultProvider: DEFAULT_PROVIDER,
    defaultModel: DEFAULT_MODEL,
    ...modelManifestContext,
  });
  const configuredThinkingCatalog = buildConfiguredModelCatalog({
    cfg,
    workspaceDir,
    ...modelManifestContext,
  });
  const thinkingLevelsHint = formatThinkingLevels(
    configuredModel.provider,
    configuredModel.model,
    ", ",
    configuredThinkingCatalog.length > 0 ? configuredThinkingCatalog : undefined,
  );
  const thinkOverride = normalizeThinkLevel(opts.thinking);
  const thinkOnce = normalizeThinkLevel(opts.thinkingOnce);
  if (opts.thinking && !thinkOverride) {
    throw new Error(`Invalid thinking level. Use one of: ${thinkingLevelsHint}.`);
  }
  if (opts.thinkingOnce && !thinkOnce) {
    throw new Error(`Invalid one-shot thinking level. Use one of: ${thinkingLevelsHint}.`);
  }
  await ensureAgentWorkspace({
    dir: workspaceDirRaw,
    ensureBootstrapFiles: !agentCfg?.skipBootstrap,
    skipOptionalBootstrapFiles: agentCfg?.skipOptionalBootstrapFiles,
  });
  const runId = opts.runId?.trim() || sessionId;
  const { getAcpSessionManager } = await loadAcpManagerRuntime();
  const acpManager = getAcpSessionManager();
  const acpResolution = sessionKey
    ? acpManager.resolveSession({
        cfg,
        sessionKey,
      })
    : null;
  const body =
    !isRawModelRun && acpResolution?.kind === "ready"
      ? resolveAcpPromptBody(message, opts.internalEvents)
      : prependInternalEventContext(message, opts.internalEvents);
  const transcriptBody =
    opts.transcriptMessage ?? resolveInternalEventTranscriptBody(message, opts.internalEvents);

  return {
    body,
    transcriptBody,
    cfg,
    configuredThinkingCatalog,
    normalizedSpawned,
    agentCfg,
    thinkOverride,
    thinkOnce,
    verboseOverride,
    timeoutMs,
    sessionId,
    sessionKey,
    sessionEntry: sessionEntryRaw,
    sessionStore,
    storePath,
    isNewSession,
    persistedThinking,
    persistedVerbose,
    sessionAgentId,
    outboundSession,
    workspaceDir,
    agentDir,
    modelManifestContext,
    runId,
    acpManager,
    acpResolution,
  };
}
