import {
  configure as configureOptions,
  getConfig,
  isEnabled,
  setEnabled,
  type LookmanConfig,
} from './config.js';
import { fingerprint, getType, isThenable } from './serialize.js';
import { parseCallSite } from './stack.js';
import {
  bumpIndent,
  getCounters,
  getHistory,
  getTimers,
  resetState,
} from './state.js';
import { computeDiff, formatDiffLines } from '../features/diff.js';
import { handlePromise } from '../features/promise.js';
import { watchObject } from '../features/watch.js';
import { trackTarget } from '../features/track.js';
import { assertCondition } from '../features/assert.js';
import { onceLog } from '../features/once.js';
import { traceFn } from '../features/fn.js';
import { emit } from '../formatters/emit.js';
import { colorize } from '../formatters/values.js';

export type { LookmanConfig };

function logValue<T>(value: T, label: string | undefined, callSite = parseCallSite()): T {
  const { file, line, fn } = callSite;
  const type = getType(value);
  const serialized = fingerprint(value);
  const key = label ? `${file}:${label}` : `${file}:${line}`;
  const history = getHistory();
  const prevEntry = history.get(key);
  const isNew = prevEntry === undefined;
  const changed = !isNew && prevEntry.fingerprint !== serialized;

  let prev: unknown;
  let diffLines: string[] | undefined;
  if (changed && prevEntry) {
    prev = prevEntry.value;
    const changes = computeDiff(prevEntry.value, value);
    if (changes.length > 0) {
      diffLines = formatDiffLines(changes, getConfig().colors);
    }
  }

  history.set(key, { fingerprint: serialized, value });

  const colors = getConfig().colors;
  emit({
    type: 'debug',
    file,
    line,
    fn,
    label,
    value,
    valueType: type,
    badge: isNew
      ? ''
      : changed
        ? colorize('bold', colorize('yellow', ' ⚡ CHANGED', colors), colors)
        : colorize('dim', ' (unchanged)', colors),
    changed,
    isNew,
    prev,
    diffLines,
    icon: ' DBG ',
  });

  return value;
}

/**
 * Log a value with source location, type, and change detection.
 * Returns the original value unchanged (including Promises / thenables).
 */
function dbgFn<T>(value: T, label?: string): T {
  if (!isEnabled()) return value;

  const callSite = parseCallSite();

  if (isThenable(value)) {
    return handlePromise(value as PromiseLike<unknown>, label, callSite) as T;
  }

  return logValue(value, label, callSite);
}

function silentFn<T>(value: T, label?: string): T {
  if (!isEnabled()) return value;

  const callSite = parseCallSite();
  const { file, line } = callSite;
  const serialized = fingerprint(value);
  const key = label ? `${file}:${label}` : `${file}:${line}`;
  const history = getHistory();
  const prev = history.get(key);
  const isNew = prev === undefined;
  const changed = !isNew && prev.fingerprint !== serialized;

  if (changed || isNew) {
    return logValue(value, label, callSite);
  }
  return value;
}

function countFn(label = 'default'): number | undefined {
  if (!isEnabled()) return undefined;
  const { file, line } = parseCallSite();
  const key = `${file}:${label}`;
  const counters = getCounters();
  const count = (counters.get(key) || 0) + 1;
  counters.set(key, count);
  emit({ type: 'count', file, line, label, count });
  return count;
}

function timeFn(label = 'default'): void {
  if (!isEnabled()) return;
  getTimers().set(label, Date.now());
  emit({ type: 'time', label });
}

function timeEndFn(label = 'default'): number | undefined {
  if (!isEnabled()) return undefined;
  const timers = getTimers();
  const start = timers.get(label);
  if (start === undefined) {
    emit({ type: 'timeEnd', label, message: `timer '${label}' does not exist.` });
    return undefined;
  }
  const duration = Date.now() - start;
  timers.delete(label);
  emit({ type: 'timeEnd', label, durationMs: duration });
  return duration;
}

function groupFn(label?: string): void {
  if (!isEnabled()) return;
  emit({ type: 'group', label });
  bumpIndent(1);
}

function groupEndFn(): void {
  if (!isEnabled()) return;
  bumpIndent(-1);
}

function tableFn(data: unknown, label?: string): void {
  if (!isEnabled()) return;
  const { file, line } = parseCallSite();
  emit({ type: 'table', file, line, label, value: data });
}

function logFn(...args: unknown[]): void {
  if (!isEnabled()) return;
  const { file, line, fn } = parseCallSite();
  emit({ type: 'log', file, line, fn, args });
}

function diffFn(previous: unknown, current: unknown): void {
  if (!isEnabled()) return;
  const changes = computeDiff(previous, current);
  const colors = getConfig().colors;
  emit({
    type: 'diff',
    diffLines: formatDiffLines(changes, colors),
    value: changes,
  });
}

function resetFn(): void {
  // Always reset — even when disabled (needed for tests)
  resetState();
}

export interface Dbg {
  <T>(value: T, label?: string): T;
  count(label?: string): number | undefined;
  time(label?: string): void;
  timeEnd(label?: string): number | undefined;
  group(label?: string): void;
  groupEnd(): void;
  table(data: unknown, label?: string): void;
  watch<T extends object>(target: T, label?: string): T;
  track<T extends object>(target: T, label?: string): T;
  log(...args: unknown[]): void;
  silent<T>(value: T, label?: string): T;
  reset(): void;
  diff(previous: unknown, current: unknown): void;
  assert(condition: unknown, message?: string): boolean;
  once<T>(key: string, value: T, label?: string): T;
  fn<T extends (...args: never[]) => unknown>(fn: T, label?: string): T;
  configure(options: Partial<LookmanConfig>): Readonly<LookmanConfig>;
  enabled: boolean;
}

export const dbg: Dbg = Object.assign(dbgFn, {
  count: countFn,
  time: timeFn,
  timeEnd: timeEndFn,
  group: groupFn,
  groupEnd: groupEndFn,
  table: tableFn,
  watch: watchObject,
  track: trackTarget,
  log: logFn,
  silent: silentFn,
  reset: resetFn,
  diff: diffFn,
  assert: assertCondition,
  once: onceLog,
  fn: traceFn as Dbg['fn'],
  configure: configureOptions,
}) as Dbg;

Object.defineProperty(dbg, 'enabled', {
  get() {
    return isEnabled();
  },
  set(value: boolean) {
    setEnabled(Boolean(value));
  },
  enumerable: true,
  configurable: true,
});
