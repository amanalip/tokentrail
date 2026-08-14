// Import React's strict development checks to surface unsafe component behavior early.
import { StrictMode } from 'react';

// Import the maintained concurrent renderer entry point.
import { createRoot } from 'react-dom/client';

// Import the Phase 1 local shell component.
import { App } from './App';

// Import local styles so the renderer never depends on remote fonts or CSS.
import './styles.css';

// Resolve the one application-owned mount point from the static entry document.
const rootElement = document.getElementById('root');

// Fail clearly if packaging or HTML editing removes the required root instead of silently showing a blank window.
if (rootElement === null) {
  throw new Error('Token Trail renderer root was not found.');
}

// Create the React root only after the required element has been validated.
const root = createRoot(rootElement);

// Render the local shell under StrictMode so lifecycle mistakes appear during development.
root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
