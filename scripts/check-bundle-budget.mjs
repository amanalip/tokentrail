// Enforce the reviewed renderer JavaScript bundle budgets.
//
// Responsibility: fail any build whose shipped renderer script sizes exceed the approved budget,
// so growth is a deliberate, recorded decision instead of silent drift. Trust level: local build
// tooling reading generated files. Dependencies: the Vite renderer output directory and Node's
// zlib for gzip-size evaluation. Side effects: none; this check never rewrites files.
// Denied behavior: no network access and no mutation of application source or output.

// Import filesystem helpers so the check reads real emitted artifacts rather than estimates.
import { readdirSync, readFileSync, statSync } from 'node:fs';

// Import path helpers so the output directory resolves from the repository root consistently.
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Import Node's zlib so byte budgets are evaluated against gzip transfer size as well as raw.
import { gzipSync } from 'node:zlib';

const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const assetsDirectory = join(repositoryRoot, 'dist', 'renderer', 'assets');

/**
 * The reviewed budgets, derived from Phase 4 measurements after moving ECharts onto its own lazy
 * route chunk: entry-plus-shared code measured 314,367 raw bytes, the chart chunk 512,458 raw
 * bytes, and all renderer scripts together 826,825 raw bytes. Headroom rounds each up by roughly
 * ten percent so ordinary patch churn builds green while real regressions still fail. Any budget
 * change requires new measurements and a recorded revision per plan section 8.5.
 */
const BUDGETS = Object.freeze({
  initialRawBytes: 350_000,
  initialGzipBytes: 110_000,
  chartChunkRawBytes: 560_000,
  totalRawBytes: 920_000,
});

// Collect emitted renderer scripts; the known lazy chart chunk is classified by name prefix.
let scriptNames;
try {
  scriptNames = readdirSync(assetsDirectory).filter((entry) => entry.endsWith('.js'));
} catch {
  console.error('No renderer assets found. Run `npm run build` before checking budgets.');
  process.exit(1);
}

if (scriptNames.length === 0) {
  console.error('Renderer assets directory is empty. Run `npm run build` first.');
  process.exit(1);
}

let initialRawBytes = 0;
let initialGzipBytes = 0;
let chartChunkRawBytes = 0;
let totalRawBytes = 0;

for (const name of scriptNames) {
  const rawBytes = statSync(join(assetsDirectory, name)).size;
  const gzipBytes = gzipSync(readFileSync(join(assetsDirectory, name))).length;
  totalRawBytes += rawBytes;
  if (name.startsWith('UsageRoute')) {
    chartChunkRawBytes += rawBytes;
  } else {
    initialRawBytes += rawBytes;
    initialGzipBytes += gzipBytes;
  }
}

// Report observed numbers so both passing runs and failures carry their own evidence.
process.stdout.write(
  `renderer js: initial ${initialRawBytes} raw / ${initialGzipBytes} gz, ` +
    `chart chunk ${chartChunkRawBytes} raw, total ${totalRawBytes} raw\n`,
);

/** Evaluate one measured value against its ceiling, returning a failure sentence or null. */
function overBudget(label, measured, ceiling) {
  return measured > ceiling ? `${label}: ${measured} > ${ceiling} bytes` : null;
}

const failures = [
  overBudget('initial renderer js (raw)', initialRawBytes, BUDGETS.initialRawBytes),
  overBudget('initial renderer js (gzip)', initialGzipBytes, BUDGETS.initialGzipBytes),
  overBudget('chart chunk (raw)', chartChunkRawBytes, BUDGETS.chartChunkRawBytes),
  overBudget('total renderer js (raw)', totalRawBytes, BUDGETS.totalRawBytes),
].filter((failure) => failure !== null);

if (failures.length > 0) {
  console.error(`Renderer bundle budget exceeded:\n  - ${failures.join('\n  - ')}`);
  console.error(
    'Reduce sizes or record a measured budget revision in the performance architecture document before raising limits.',
  );
  process.exit(1);
}

process.stdout.write('renderer bundle budgets satisfied.\n');
