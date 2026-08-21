// Import React state, memoization, and effects for the local search filter and deep-link focus.
import { useEffect, useMemo, useState } from 'react';

// Describe one packaged explanation entry with its stable topic grouping and deep-link identifier.
interface LearnEntry {
  // Keep one machine-safe identifier so contextual links can target this entry without free-form hashes.
  readonly id: string;
  readonly title: string;
  readonly group: 'Usage basics' | 'Limits and resets' | 'Privacy and sources';
  readonly body: string;
}

// Package the complete reviewed explanation set as local text only; nothing is fetched remotely.
const ENTRIES: readonly LearnEntry[] = Object.freeze([
  {
    id: 'tokens-vs-quota',
    title: 'Tokens vs quota',
    group: 'Usage basics',
    body: 'Token totals describe how much text went through Codex. Quota percentages are reported separately by Codex for its own capacity windows. The two measurements are related but not convertible, so Token Trail never converts one into the other.',
  },
  {
    id: 'included-vs-credits',
    title: 'Included vs credits',
    group: 'Usage basics',
    body: 'Included usage is part of a plan and is reported through quota windows. Credits are separate balances that Codex reports as strings with their own units. Token Trail displays both without adding them together.',
  },
  {
    id: 'codex-vs-api-usage',
    title: 'Codex vs API usage',
    group: 'Usage basics',
    body: 'Codex plan usage and OpenAI API billing are separate systems. Token Trail reads only the local Codex app-server account data and never represents API billing state.',
  },
  {
    id: 'rolling-windows',
    title: 'Rolling windows',
    group: 'Limits and resets',
    body: 'A rolling quota window covers a reported duration such as five hours or a week. The percentage can change unevenly because the window slides continuously rather than resetting at one fixed instant.',
  },
  {
    id: 'when-a-limit-is-hit',
    title: 'When a limit is hit',
    group: 'Limits and resets',
    body: 'A reached state appears only when Codex reports it, and it applies to the reported bucket. Token Trail never predicts that you will be blocked or assigns a bucket-level reached state to one window.',
  },
  {
    id: 'reset-countdown',
    title: 'Reset countdown',
    group: 'Limits and resets',
    body: 'Countdowns are calculated from the reported reset timestamp and your local clock. When a reset time passes, Token Trail waits for a new snapshot from Codex rather than assuming the reset occurred.',
  },
  {
    id: 'what-is-read',
    title: 'What is read',
    group: 'Privacy and sources',
    body: 'Token Trail reads only approved account-level fields: account kind and plan label, rate-limit snapshots, aggregate usage buckets, and credit information. Prompts, responses, tasks, repositories, files, and tool calls are never requested.',
  },
  {
    id: 'provenance',
    title: 'Provenance',
    group: 'Privacy and sources',
    body: 'Every value is labeled with its source: Codex-reported values come from the local app-server, calculated values are derived locally from those values, and locally observed values describe what this running process saw.',
  },
  {
    id: 'diagnostics',
    title: 'Diagnostics',
    group: 'Privacy and sources',
    body: 'Diagnostic exports contain only allowlisted technical fields. A preview is always shown before saving, and seeded canary tests verify that no sensitive value can enter the document.',
  },
  {
    id: 'session-changes-vs-history',
    title: 'Session changes vs history',
    group: 'Privacy and sources',
    body: 'Changes since Token Trail opened compare the current snapshot against an in-memory baseline. They disappear when the process exits and are never written to disk.',
  },
  {
    id: 'missing-days-statistics',
    title: 'How statistics handle missing days',
    group: 'Usage basics',
    body: 'A missing date stays missing and is never treated as zero. Comparisons require every date in both periods to be supplied, and coverage explains exactly what was received.',
  },
  {
    id: 'why-capacity-is-not-scored',
    title: 'Why capacity is not scored',
    group: 'Limits and resets',
    body: 'Quota percentages, credit strings, spending controls, and reset-credit counts use different units. Combining them into one score would invent meaning, so Token Trail shows them side by side instead.',
  },
]);

// Export the closed identifier list so navigation parsing can validate deep links without importing React.
export const LEARN_ENTRY_IDS: readonly string[] = Object.freeze(ENTRIES.map((entry) => entry.id));

/**
 * Render the searchable local explanation library. When `focusEntryId` names a reviewed entry, that card is
 * highlighted and scrolled into view so contextual links from metrics land on the relevant explanation.
 */
export function LearnRoute({ focusEntryId }: { focusEntryId?: string | null }) {
  // Track the local search text; it never leaves the renderer.
  const [query, setQuery] = useState('');

  // Filter entries locally over packaged text only.
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (normalized.length === 0) return ENTRIES;
    return ENTRIES.filter(
      (entry) =>
        entry.title.toLowerCase().includes(normalized) ||
        entry.body.toLowerCase().includes(normalized),
    );
  }, [query]);

  // Group filtered entries by their reviewed topic groups in stable order.
  const groups = useMemo(() => {
    const order: LearnEntry['group'][] = [
      'Usage basics',
      'Limits and resets',
      'Privacy and sources',
    ];
    return order.map((group) => ({
      group,
      entries: filtered.filter((entry) => entry.group === group),
    }));
  }, [filtered]);

  // Move keyboard and pointer attention to the deep-linked card after the filtered list settles.
  // Focusing the card (not just highlighting it) lets assistive technology announce the exact
  // explanation a contextual link targeted instead of leaving focus at the document top.
  useEffect(() => {
    // Ignore navigation that did not name a reviewed entry.
    if (focusEntryId === null || focusEntryId === undefined) return;

    // Resolve the rendered card through its stable data attribute rather than text matching.
    const card = document.querySelector<HTMLElement>(`[data-learn-entry="${focusEntryId}"]`);
    if (card === null) return;

    // Scroll where the platform supports it; jsdom tests simply assert the highlight class instead.
    if (typeof card.scrollIntoView === 'function') {
      card.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }

    // The negative tab index makes the card focusable without inserting it into Tab order.
    card.setAttribute('tabindex', '-1');
    card.focus();
  }, [focusEntryId, filtered]);

  // Render the complete Learn route.
  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Local explanations, no remote search</p>
          <h1>Learn</h1>
        </div>
      </header>

      <form className="learn-search" role="search" onSubmit={(event) => event.preventDefault()}>
        <label htmlFor="learn-query">Search explanations</label>
        <input
          id="learn-query"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search explanations"
        />
      </form>

      {filtered.length === 0 ? (
        <p className="empty-detail">No explanation matches that search.</p>
      ) : (
        groups.map(({ group, entries }) =>
          entries.length === 0 ? null : (
            <section
              className="panel"
              key={group}
              aria-labelledby={`learn-${group.replace(/\s+/gu, '-')}`}
            >
              <div className="section-heading">
                <h2 id={`learn-${group.replace(/\s+/gu, '-')}`}>{group}</h2>
              </div>
              <div className="learn-grid">
                {entries.map((entry) => (
                  <article
                    className={`learn-card ${
                      entry.id === focusEntryId ? 'learn-card--focused' : ''
                    }`}
                    key={entry.title}
                    data-learn-entry={entry.id}
                  >
                    <h3>{entry.title}</h3>
                    <p>{entry.body}</p>
                  </article>
                ))}
              </div>
            </section>
          ),
        )
      )}
    </>
  );
}
