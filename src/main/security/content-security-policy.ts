/**
 * This policy permits only application-owned resources and rejects plugins, frames, forms, remote connections,
 * inline scripts, and dynamic code evaluation. It is used by the packaged protocol response and production HTML.
 */
export const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'",
].join('; ');

/**
 * Permit Vite's development-only style injection and loopback hot-update socket without changing the packaged
 * policy above. This value is consumed only by Vite's `serve` command and is never installed by the application
 * protocol that serves packaged content.
 */
export const DEVELOPMENT_CONTENT_SECURITY_POLICY = [
  // Keep the same fail-closed default used by the packaged application.
  "default-src 'self'",
  // Continue to reject inline scripts and dynamic evaluation in the development renderer.
  "script-src 'self'",
  // Allow only Vite's development-time inline stylesheet mechanism; production retains the self-only rule.
  "style-src 'self' 'unsafe-inline'",
  // Permit local bundled images and data-backed raster assets exactly as production does.
  "img-src 'self' data:",
  // Keep fonts local to the renderer origin.
  "font-src 'self'",
  // Allow same-origin requests plus Vite's fixed loopback WebSocket used for hot module updates.
  "connect-src 'self' ws://127.0.0.1:5173",
  // Preserve every active-content denial from the packaged policy.
  "object-src 'none'",
  // Prevent an injected base element from changing URL resolution.
  "base-uri 'none'",
  // Prevent the development renderer from submitting forms.
  "form-action 'none'",
  // Prevent another document from embedding the local development renderer.
  "frame-ancestors 'none'",
].join('; ');
