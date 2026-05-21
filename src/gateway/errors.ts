// Typed gateway error factory — all gateway error creation flows through here.
// Callers import createGatewayError() rather than constructing error objects inline.
import { ErrorCodes, errorShape, type ErrorShape } from "./protocol/schema.js";

export { ErrorCodes };

export type GatewayErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

export type { ErrorShape as GatewayErrorShape };

export interface GatewayErrorOpts {
  details?: unknown;
  retryable?: boolean;
  retryAfterMs?: number;
}

export function createGatewayError(
  code: GatewayErrorCode,
  message: string,
  opts?: GatewayErrorOpts,
): ErrorShape {
  return errorShape(code, message, opts);
}

// Common pre-built errors for the most frequent cases
export const GatewayErrors = {
  invalidRequest: (message: string, opts?: GatewayErrorOpts) =>
    createGatewayError(ErrorCodes.INVALID_REQUEST, message, opts),
  unavailable: (message = "Service unavailable", opts?: GatewayErrorOpts) =>
    createGatewayError(ErrorCodes.UNAVAILABLE, message, opts),
  notLinked: (message = "Not linked") =>
    createGatewayError(ErrorCodes.NOT_LINKED, message),
  notPaired: (message = "Not paired") =>
    createGatewayError(ErrorCodes.NOT_PAIRED, message),
  agentTimeout: (message = "Agent timed out") =>
    createGatewayError(ErrorCodes.AGENT_TIMEOUT, message),
  approvalNotFound: (message = "Approval not found") =>
    createGatewayError(ErrorCodes.APPROVAL_NOT_FOUND, message),
} as const;
