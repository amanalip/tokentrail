// Import React state for the local search filter.
import { useMemo, useState } from 'react';

// Describe one packaged explanation entry with its stable topic grouping.
interface LearnEntry {
  readonly title: string;
  readonly group: 'Usage basics' | 'Limits and resets' | 'Privacy and sources';
  readonly body: string;
}

// Package the complete reviewed explanation set as local text only; nothing is fetched remotely.
const ENTRIES: readonly LearnEntry[] = Object.freeze([
  {
    title: 'Tokens vs quota',
    group: 'Usage basics',
    body: 'Token totals describe how much text went through Codex. Quota percentages are reported separately by Codex for its own capacity windows. The two measurements are related but not convertible, so Token Trail never converts one into the other.',
  },
  {
    title: 'Included vs credits',
    group: 'Usage basics',
    body: 'Included usage is part of a plan and is reported through quota windows. Credits are separate balances that Codex reports as strings with their own units. Token Trail displays both without adding them together.',
  },
  {
    title: 'Codex vs API usage',
    group: 'Usage basics',
    body: 'Codex plan usage and OpenAI API billing are separate systems. Token Trail reads only the local Codex app-server account data and never represents API billing state.',
  },
  {
    title: 'Rolling windows',
    group: 'Limits and resets',
    body: 'A rolling quota window covers a reported duration such as five hours or a week. The percentage can change unevenly because the window slides continuously rather than resetting at one fixed instant.',
  },
  {
    title: 'When a limit is hit',
    group: 'Limits and resets',
    body: 'A reached state appears only when Codex reports it, and it applies to the reported bucket. Token Trail never predicts that you will be blocked or assigns a bucket-level reached state to one window.',
  },
  {
    title: 'Reset countdown',
    group: 'Limits and resets',
    body: 'Countdowns are calculated from the reported reset timestamp and your local clock. When a reset time passes, Token Trail waits for a new snapshot from Codex rather than assuming the reset occurred.',
  },
  {
    title: 'What is read',
    group: 'Privacy and sources',
    body: 'Token Trail reads only approved account-level fields: account kind and plan label, rate-limit snapshots, aggregate usage buckets, and credit information. Prompts, responses, tasks, repositories, files, and tool calls are never requested.',
  },
  {
    title: 'Provenance',
    group: 'Privacy and sources',
    body: 'Every value is labeled with its source: Codex-reported values come from the local app-server, calculated values are derived locally from those values, and locally observed values describe what this running process saw.',
  },
  {
    title: 'Diagnostics',
    group: 'Privacy and sources',
    body: 'Diagnostic exports contain only allowlisted technical fields. A preview is always shown before saving, and seeded canary tests verify that no sensitive value can enter the document.',
  },
  {
    title: 'Session changes vs history',
    group: 'Privacy and sources',
    body: 'Changes since Token Trail opened compare the current snapshot against an in-memory baseline. They disappear when the process exits and are never written to disk.',
  },
  {
    title: 'How statistics handle missing days',
    group: 'Usage basics',
    body: 'A missing date stays missing and is never treated as zero. Comparisons require every date in both periods to be supplied, and coverage explains exactly what was received.',
  },
  {
    title: 'Why capacity is not scored',
    group: 'Limits and resets',
    body: 'Quota percentages, credit strings, spending controls, and reset-credit counts use different units. Combining them into one score would invent meaning, so Token Trail shows them side by side instead.',
  },
]);

/** Render the searchable local explanation library. */
export function LearnRoute() {
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
                  <article className="learn-card" key={entry.title}>
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
