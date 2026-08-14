// Import renderer testing helpers that query the interface through user-visible semantics.
import { render, screen, within } from '@testing-library/react';

// Import Vitest's explicit assertion and test functions.
import { expect, it } from 'vitest';

// Import the Phase 1 shell component under test.
import { App } from './App';

// Confirm the shell states its real development status without placeholder account values.
it('renders the honest Phase 1 foundation state', () => {
  // Render the component into the isolated jsdom document.
  render(<App />);

  // Confirm the page has one accessible product heading.
  expect(screen.getByRole('heading', { level: 1, name: 'TokenTrail' })).not.toBeNull();

  // Confirm assistive technology receives the current implementation state.
  expect(screen.getByRole('status').textContent).toContain('Phase 1 foundation');

  // Confirm the shell explicitly says that Codex data is not connected yet.
  expect(screen.getByText(/Codex account data is not connected yet/i)).not.toBeNull();

  // Resolve the boundary section through its accessible heading.
  const boundaryHeading = screen.getByRole('heading', { level: 2, name: 'Current boundary' });
  const boundarySection = boundaryHeading.closest('section');

  // Fail clearly if the semantic section wrapper is accidentally removed.
  expect(boundarySection).not.toBeNull();

  // Confirm all four security guarantees remain visible as a semantic list.
  expect(within(boundarySection!).getAllByRole('listitem')).toHaveLength(4);
});
