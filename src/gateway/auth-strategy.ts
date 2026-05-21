// Auth strategy contract — one implementation per auth mode.
// Add new auth modes by implementing this interface; no changes to authorizeGatewayConnect.
import type { IncomingMessage } from "node:http";
import type { GatewayAuthResult, GatewayAuthSurface } from "./auth.js";
import type { ResolvedGatewayAuth } from "./auth-resolve.js";

/** Minimal auth credentials forwarded by the connecting client. */
export type ConnectAuthCredentials = {
  token?: string;
  password?: string;
};

export interface AuthStrategyInput {
  req?: IncomingMessage;
  connectAuth?: ConnectAuthCredentials | null;
  resolvedAuth: ResolvedGatewayAuth;
  authSurface: GatewayAuthSurface;
  clientIp?: string;
}

export interface AuthStrategy {
  /** Returns a result if this strategy can handle the request, null to skip. */
  authorize(
    input: AuthStrategyInput,
  ): Promise<GatewayAuthResult | null> | GatewayAuthResult | null;
}
