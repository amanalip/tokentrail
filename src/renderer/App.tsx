// Import the one approved Phase 1 logo so Vite packages no unused branding board or alternate treatment.
import logoUrl from '../../assets/branding/tokentrail-logo-dark.png';

/**
 * Render the honest Phase 1 shell. It demonstrates local branded content and process isolation without showing
 * fabricated account values or implying that the Codex connection and product routes already exist.
 */
export function App() {
  // Return one main landmark with a concise development state that remains understandable without decoration.
  return (
    <main className="shell">
      {/* Group brand and implementation status as the page's primary introduction. */}
      <section className="intro" aria-labelledby="page-title">
        {/* Use the approved local concept asset without any remote request. */}
        <img className="logo" src={logoUrl} alt="" width="128" height="128" />

        {/* Identify the product with the page's only level-one heading. */}
        <h1 id="page-title">TokenTrail</h1>

        {/* Keep the approved product promise visible while the feature implementation is incomplete. */}
        <p className="tagline">Understand your Codex usage.</p>

        {/* Announce the accurate milestone instead of rendering placeholder metrics. */}
        <p className="status" role="status">
          Phase 1 foundation
        </p>

        {/* Explain the current boundary in ordinary language for developers and early reviewers. */}
        <p className="summary">
          The hardened local Electron shell is running. Codex account data is not connected yet.
        </p>
      </section>

      {/* Expose the foundation guarantees as text so security is reviewable without inspecting decoration. */}
      <section className="boundary" aria-labelledby="boundary-title">
        {/* Name the supporting section for screen-reader and visual navigation. */}
        <h2 id="boundary-title">Current boundary</h2>

        {/* Keep the short list semantic and easy to scan. */}
        <ul>
          <li>Local packaged interface</li>
          <li>Sandboxed renderer</li>
          <li>No Node.js access in the interface</li>
          <li>No telemetry or remote content</li>
        </ul>
      </section>
    </main>
  );
}
