export interface DiffChange {
  path: string;
  kind: 'added' | 'removed' | 'changed';
  from?: unknown;
  to?: unknown;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    !(value instanceof Date) &&
    !(value instanceof Error) &&
    !(typeof Map !== 'undefined' && value instanceof Map) &&
    !(typeof Set !== 'undefined' && value instanceof Set)
  );
}

function sameRefOrEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a === 'number' && typeof b === 'number' && Number.isNaN(a) && Number.isNaN(b)) {
    return true;
  }
  return false;
}

function walk(
  prev: unknown,
  curr: unknown,
  path: string,
  changes: DiffChange[],
  seen: WeakSet<object>,
): void {
  if (sameRefOrEqual(prev, curr)) return;

  // Circular guard
  if (typeof curr === 'object' && curr !== null) {
    if (seen.has(curr)) return;
    seen.add(curr);
  }
  if (typeof prev === 'object' && prev !== null) {
    if (seen.has(prev) && curr !== prev) {
      // prev already visited in another branch; still compare leaves
    } else if (typeof curr !== 'object' || curr === null) {
      seen.add(prev);
    } else {
      seen.add(prev);
    }
  }

  if (Array.isArray(prev) && Array.isArray(curr)) {
    const max = Math.max(prev.length, curr.length);
    for (let i = 0; i < max; i++) {
      const p = `${path}[${i}]`;
      if (i >= prev.length) {
        changes.push({ path: p, kind: 'added', to: curr[i] });
      } else if (i >= curr.length) {
        changes.push({ path: p, kind: 'removed', from: prev[i] });
      } else {
        walk(prev[i], curr[i], p, changes, seen);
      }
    }
    return;
  }

  if (isPlainObject(prev) && isPlainObject(curr)) {
    const keys = new Set([...Object.keys(prev), ...Object.keys(curr)]);
    for (const key of keys) {
      const p = path ? `${path}.${key}` : key;
      const hasPrev = Object.prototype.hasOwnProperty.call(prev, key);
      const hasCurr = Object.prototype.hasOwnProperty.call(curr, key);
      if (!hasPrev && hasCurr) {
        changes.push({ path: p, kind: 'added', to: curr[key] });
      } else if (hasPrev && !hasCurr) {
        changes.push({ path: p, kind: 'removed', from: prev[key] });
      } else {
        walk(prev[key], curr[key], p, changes, seen);
      }
    }
    return;
  }

  // Different types or primitives
  if (prev === undefined && curr !== undefined) {
    changes.push({ path: path || '(root)', kind: 'added', to: curr });
  } else if (prev !== undefined && curr === undefined) {
    changes.push({ path: path || '(root)', kind: 'removed', from: prev });
  } else {
    changes.push({ path: path || '(root)', kind: 'changed', from: prev, to: curr });
  }
}

export function computeDiff(prev: unknown, curr: unknown): DiffChange[] {
  const changes: DiffChange[] = [];
  const seen = new WeakSet<object>();
  walk(prev, curr, '', changes, seen);
  return changes;
}

export function formatDiffLines(changes: DiffChange[], colors: boolean): string[] {
  const lines: string[] = [];
  const green = colors ? '\x1b[32m' : '';
  const red = colors ? '\x1b[31m' : '';
  const reset = colors ? '\x1b[0m' : '';
  const bold = colors ? '\x1b[1m' : '';

  for (const change of changes) {
    lines.push(`${bold}${change.path}${reset}`);
    if (change.kind === 'changed') {
      lines.push(`${red}- ${stringify(change.from)}${reset}`);
      lines.push(`${green}+ ${stringify(change.to)}${reset}`);
    } else if (change.kind === 'added') {
      lines.push(`${green}+ ${stringify(change.to)}${reset}`);
    } else {
      lines.push(`${red}- ${stringify(change.from)}${reset}`);
    }
    lines.push('');
  }

  // trim trailing blank
  while (lines.length && lines[lines.length - 1] === '') lines.pop();
  return lines;
}

function stringify(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'bigint') return `${value}n`;
  if (typeof value === 'symbol') return value.toString();
  if (typeof value === 'function') {
    return `[Function ${(value as { name?: string }).name || 'anonymous'}]`;
  }
  if (value === undefined) return 'undefined';
  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return String(value);
  }
}
