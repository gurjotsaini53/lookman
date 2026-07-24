export interface HistoryEntry {
  fingerprint: string;
  value: unknown;
}

const history = new Map<string, HistoryEntry>();
const counters = new Map<string, number>();
const timers = new Map<string, number>();
const onceKeys = new Set<string>();
const promiseTimers = new Map<string, number>();

let indentLevel = 0;
let promiseTimerSeq = 0;

export function getHistory(): Map<string, HistoryEntry> {
  return history;
}

export function getCounters(): Map<string, number> {
  return counters;
}

export function getTimers(): Map<string, number> {
  return timers;
}

export function getOnceKeys(): Set<string> {
  return onceKeys;
}

export function getPromiseTimers(): Map<string, number> {
  return promiseTimers;
}

export function nextPromiseTimerId(file: string, line: string, label?: string): string {
  promiseTimerSeq += 1;
  return `p:${promiseTimerSeq}:${file}:${line}:${label ?? ''}`;
}

export function getIndentLevel(): number {
  return indentLevel;
}

export function setIndentLevel(level: number): void {
  indentLevel = Math.max(0, level);
}

export function bumpIndent(delta: number): void {
  indentLevel = Math.max(0, indentLevel + delta);
}

export function resetState(): void {
  history.clear();
  counters.clear();
  timers.clear();
  onceKeys.clear();
  promiseTimers.clear();
  indentLevel = 0;
  promiseTimerSeq = 0;
}
