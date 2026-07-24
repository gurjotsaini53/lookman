const CIRCULAR = '[Circular]';

/**
 * Deterministic, circular-safe fingerprint for change detection.
 * Not JSON — handles undefined, NaN, Infinity, BigInt, Date, Error, Map, Set, etc.
 */
export function fingerprint(value: unknown, seen = new WeakSet<object>()): string {
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';

  const t = typeof value;

  if (t === 'string') return `s:${value as string}`;
  if (t === 'boolean') return `b:${value as boolean}`;
  if (t === 'number') {
    if (Number.isNaN(value as number)) return 'n:NaN';
    if (value === Infinity) return 'n:Infinity';
    if (value === -Infinity) return 'n:-Infinity';
    return `n:${value as number}`;
  }
  if (t === 'bigint') return `bi:${(value as bigint).toString()}`;
  if (t === 'symbol') return `sym:${(value as symbol).description ?? ''}`;
  if (t === 'function') {
    const fn = value as { name?: string; length: number };
    return `fn:${fn.name || 'anonymous'}:${fn.length}`;
  }

  if (t === 'object') {
    const obj = value as object;
    if (seen.has(obj)) return CIRCULAR;
    seen.add(obj);

    if (value instanceof Date) return `date:${value.toISOString()}`;
    if (value instanceof Error) {
      return `err:${value.name}:${value.message}:${value.stack ?? ''}`;
    }
    if (value instanceof RegExp) return `re:${value.toString()}`;
    if (typeof Map !== 'undefined' && value instanceof Map) {
      const parts: string[] = [];
      for (const [k, v] of value.entries()) {
        parts.push(`${fingerprint(k, seen)}=>${fingerprint(v, seen)}`);
      }
      parts.sort();
      return `map:{${parts.join(',')}}`;
    }
    if (typeof Set !== 'undefined' && value instanceof Set) {
      const parts = [...value].map((v) => fingerprint(v, seen));
      parts.sort();
      return `set:{${parts.join(',')}}`;
    }
    if (Array.isArray(value)) {
      return `arr:[${value.map((v) => fingerprint(v, seen)).join(',')}]`;
    }
    if (typeof Promise !== 'undefined' && value instanceof Promise) {
      return 'promise';
    }

    const keys = Reflect.ownKeys(obj).map(String).sort();
    const parts = keys.map((k) => {
      try {
        return `${k}:${fingerprint((obj as Record<string, unknown>)[k], seen)}`;
      } catch {
        return `${k}:[unreadable]`;
      }
    });
    return `obj:{${parts.join(',')}}`;
  }

  return `u:${String(value)}`;
}

export function getType(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (Array.isArray(value)) return `Array(${value.length})`;
  if (typeof Promise !== 'undefined' && value instanceof Promise) return 'Promise';
  if (value instanceof Error) return 'Error';
  if (value instanceof Date) return 'Date';
  if (typeof Map !== 'undefined' && value instanceof Map) return `Map(${value.size})`;
  if (typeof Set !== 'undefined' && value instanceof Set) return `Set(${value.size})`;
  if (typeof value === 'bigint') return 'bigint';
  return typeof value;
}

export function isThenable(value: unknown): value is PromiseLike<unknown> {
  return (
    value !== null &&
    (typeof value === 'object' || typeof value === 'function') &&
    typeof (value as PromiseLike<unknown>).then === 'function'
  );
}
