import type { ServerResponse } from "node:http";

// Standard security headers for all HTTP responses.
const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-XSS-Protection": "0", // disabled — modern browsers use CSP instead
};

// CSP for the control UI HTML page (stricter than API endpoints).
const CONTROL_UI_CSP =
  "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' ws: wss:; font-src 'self'; frame-ancestors 'none';";

// CSP for JSON/API responses (very strict — no scripts needed).
const API_CSP = "default-src 'none'; frame-ancestors 'none';";

export function applySecurityHeaders(res: ServerResponse, isHtmlResponse: boolean): void {
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    res.setHeader(name, value);
  }
  res.setHeader("Content-Security-Policy", isHtmlResponse ? CONTROL_UI_CSP : API_CSP);
}
