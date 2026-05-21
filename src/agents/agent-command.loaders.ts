import { createLazyImportLoader } from "../shared/lazy-promise.js";

type AttemptExecutionRuntime = typeof import("./command/attempt-execution.runtime.js");
type AcpManagerRuntime = typeof import("../acp/control-plane/manager.js");
type AcpPolicyRuntime = typeof import("../acp/policy.js");
type AcpRuntimeErrorsRuntime = typeof import("../acp/runtime/errors.js");
type AcpSessionIdentifiersRuntime = typeof import("../acp/runtime/session-identifiers.js");
type DeliveryRuntime = typeof import("./command/delivery.runtime.js");
type SessionStoreRuntime = typeof import("./command/session-store.runtime.js");
type CliCompactionRuntime = typeof import("./command/cli-compaction.js");
type TranscriptResolveRuntime = typeof import("../config/sessions/transcript-resolve.runtime.js");
type CliDepsRuntime = typeof import("../cli/deps.js");
type ExecDefaultsRuntime = typeof import("./exec-defaults.js");
type SkillsRuntime = typeof import("./skills.js");
type SkillsFilterRuntime = typeof import("./skills/filter.js");
type SkillsRefreshStateRuntime = typeof import("./skills/refresh-state.js");
type SkillsRemoteRuntime = typeof import("../infra/skills-remote.js");

const attemptExecutionRuntimeLoader = createLazyImportLoader<AttemptExecutionRuntime>(
  () => import("./command/attempt-execution.runtime.js"),
);
const acpManagerRuntimeLoader = createLazyImportLoader<AcpManagerRuntime>(
  () => import("../acp/control-plane/manager.js"),
);
const acpPolicyRuntimeLoader = createLazyImportLoader<AcpPolicyRuntime>(
  () => import("../acp/policy.js"),
);
const acpRuntimeErrorsRuntimeLoader = createLazyImportLoader<AcpRuntimeErrorsRuntime>(
  () => import("../acp/runtime/errors.js"),
);
const acpSessionIdentifiersRuntimeLoader = createLazyImportLoader<AcpSessionIdentifiersRuntime>(
  () => import("../acp/runtime/session-identifiers.js"),
);
const deliveryRuntimeLoader = createLazyImportLoader<DeliveryRuntime>(
  () => import("./command/delivery.runtime.js"),
);
const sessionStoreRuntimeLoader = createLazyImportLoader<SessionStoreRuntime>(
  () => import("./command/session-store.runtime.js"),
);
const cliCompactionRuntimeLoader = createLazyImportLoader<CliCompactionRuntime>(
  () => import("./command/cli-compaction.js"),
);
const transcriptResolveRuntimeLoader = createLazyImportLoader<TranscriptResolveRuntime>(
  () => import("../config/sessions/transcript-resolve.runtime.js"),
);
const cliDepsRuntimeLoader = createLazyImportLoader<CliDepsRuntime>(() => import("../cli/deps.js"));
const execDefaultsRuntimeLoader = createLazyImportLoader<ExecDefaultsRuntime>(
  () => import("./exec-defaults.js"),
);
const skillsRuntimeLoader = createLazyImportLoader<SkillsRuntime>(() => import("./skills.js"));
const skillsFilterRuntimeLoader = createLazyImportLoader<SkillsFilterRuntime>(
  () => import("./skills/filter.js"),
);
const skillsRefreshStateRuntimeLoader = createLazyImportLoader<SkillsRefreshStateRuntime>(
  () => import("./skills/refresh-state.js"),
);
const skillsRemoteRuntimeLoader = createLazyImportLoader<SkillsRemoteRuntime>(
  () => import("../infra/skills-remote.js"),
);

export function loadAttemptExecutionRuntime(): Promise<AttemptExecutionRuntime> {
  return attemptExecutionRuntimeLoader.load();
}

export function loadAcpManagerRuntime(): Promise<AcpManagerRuntime> {
  return acpManagerRuntimeLoader.load();
}

export function loadAcpPolicyRuntime(): Promise<AcpPolicyRuntime> {
  return acpPolicyRuntimeLoader.load();
}

export function loadAcpRuntimeErrorsRuntime(): Promise<AcpRuntimeErrorsRuntime> {
  return acpRuntimeErrorsRuntimeLoader.load();
}

export function loadAcpSessionIdentifiersRuntime(): Promise<AcpSessionIdentifiersRuntime> {
  return acpSessionIdentifiersRuntimeLoader.load();
}

export function loadDeliveryRuntime(): Promise<DeliveryRuntime> {
  return deliveryRuntimeLoader.load();
}

export function loadSessionStoreRuntime(): Promise<SessionStoreRuntime> {
  return sessionStoreRuntimeLoader.load();
}

export function loadCliCompactionRuntime(): Promise<CliCompactionRuntime> {
  return cliCompactionRuntimeLoader.load();
}

export function loadTranscriptResolveRuntime(): Promise<TranscriptResolveRuntime> {
  return transcriptResolveRuntimeLoader.load();
}

export function loadCliDepsRuntime(): Promise<CliDepsRuntime> {
  return cliDepsRuntimeLoader.load();
}

export function loadExecDefaultsRuntime(): Promise<ExecDefaultsRuntime> {
  return execDefaultsRuntimeLoader.load();
}

export function loadSkillsRuntime(): Promise<SkillsRuntime> {
  return skillsRuntimeLoader.load();
}

export function loadSkillsFilterRuntime(): Promise<SkillsFilterRuntime> {
  return skillsFilterRuntimeLoader.load();
}

export function loadSkillsRefreshStateRuntime(): Promise<SkillsRefreshStateRuntime> {
  return skillsRefreshStateRuntimeLoader.load();
}

export function loadSkillsRemoteRuntime(): Promise<SkillsRemoteRuntime> {
  return skillsRemoteRuntimeLoader.load();
}
