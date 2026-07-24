/**
 * Simple micro-benchmarks. Not a claim of superiority — methodology:
 * measure ops/sec for primitive logging with console.log, Lookman enabled,
 * and Lookman disabled.
 */
import { performance } from 'node:perf_hooks';
import { dbg } from '../src/index.js';

const ITER = 20_000;

function bench(name: string, fn: () => void): number {
  // warmup
  for (let i = 0; i < 1000; i++) fn();
  const start = performance.now();
  for (let i = 0; i < ITER; i++) fn();
  const ms = performance.now() - start;
  const ops = Math.round((ITER / ms) * 1000);
  console.log(`${name.padEnd(28)} ${ms.toFixed(1).padStart(8)}ms  ${String(ops).padStart(10)} ops/s`);
  return ops;
}

// Silence Lookman / console during benches that intentionally log
const originalLog = console.log;
const sink = (..._args: unknown[]) => {};

async function main() {
  originalLog('\nLookman micro-benchmarks');
  originalLog(`iterations: ${ITER}\n`);

  console.log = sink;
  dbg.configure({ enabled: true, colors: false, format: 'pretty', location: false });
  dbg.reset();

  const consoleOps = bench('console.log (primitive)', () => {
    console.log(42);
  });

  dbg.enabled = true;
  const enabledOps = bench('lookman enabled', () => {
    dbg(42, 'bench');
  });

  dbg.enabled = false;
  const disabledOps = bench('lookman disabled', () => {
    dbg(42, 'bench');
  });

  dbg.enabled = true;
  const obj = { a: 1, b: { c: 2 }, d: [1, 2, 3] };
  const objOps = bench('lookman object', () => {
    dbg(obj, 'obj');
  });

  const large = { items: Array.from({ length: 100 }, (_, i) => ({ i, v: `x${i}` })) };
  const largeOps = bench('lookman large object', () => {
    dbg(large, 'large');
  });

  dbg.enabled = false;
  const disabledObjOps = bench('lookman disabled (obj)', () => {
    dbg(obj, 'obj2');
  });

  console.log = originalLog;
  originalLog('\nSummary (higher ops/s is faster):');
  originalLog(`  console.log:           ${consoleOps} ops/s`);
  originalLog(`  lookman enabled:       ${enabledOps} ops/s`);
  originalLog(`  lookman disabled:      ${disabledOps} ops/s`);
  originalLog(`  lookman object:        ${objOps} ops/s`);
  originalLog(`  lookman large object:  ${largeOps} ops/s`);
  originalLog(`  lookman disabled obj:  ${disabledObjOps} ops/s`);
  originalLog(
    `\nDisabled/enabled ratio: ${(disabledOps / Math.max(enabledOps, 1)).toFixed(1)}x`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
