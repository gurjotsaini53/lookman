const COLORS = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  white: '\x1b[37m',
} as const;

export type ColorName = keyof typeof COLORS;

export function colorize(color: ColorName, text: string, enabled: boolean): string {
  if (!enabled) return text;
  return `${COLORS[color]}${text}${COLORS.reset}`;
}

export function formatValue(value: unknown, colors: boolean): string {
  if (value === null || value === undefined) {
    return colorize('dim', String(value), colors);
  }
  if (typeof value === 'string') {
    return colorize('green', `"${value}"`, colors);
  }
  if (typeof value === 'number' || typeof value === 'bigint') {
    return colorize('yellow', String(value), colors);
  }
  if (typeof value === 'boolean') {
    return colorize('magenta', String(value), colors);
  }
  if (typeof value === 'symbol') {
    return colorize('magenta', value.toString(), colors);
  }
  if (typeof value === 'function') {
    return colorize(
      'cyan',
      `[Function ${(value as { name?: string }).name || 'anonymous'}]`,
      colors,
    );
  }
  if (value instanceof Error) {
    return colorize('red', `${value.name}: ${value.message}`, colors);
  }
  if (value instanceof Date) {
    return colorize('cyan', value.toISOString(), colors);
  }
  if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
    try {
      return colorize('cyan', JSON.stringify(value, replacer(), 2) ?? String(value), colors);
    } catch {
      return colorize('dim', '[Circular]', colors);
    }
  }
  return colorize('white', String(value), colors);
}

function replacer() {
  const seen = new WeakSet<object>();
  return (_key: string, val: unknown) => {
    if (typeof val === 'bigint') return `${val}n`;
    if (typeof val === 'object' && val !== null) {
      if (seen.has(val)) return '[Circular]';
      seen.add(val);
    }
    if (val instanceof Error) {
      return { name: val.name, message: val.message };
    }
    if (typeof Map !== 'undefined' && val instanceof Map) {
      return Object.fromEntries(val.entries());
    }
    if (typeof Set !== 'undefined' && val instanceof Set) {
      return [...val];
    }
    return val;
  };
}

/** JSON-safe clone for structured output (no ANSI). */
export function toJsonValue(value: unknown, depth = 0): unknown {
  if (depth > 20) return '[MaxDepth]';
  if (value === undefined) return null;
  if (value === null) return null;
  if (typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (Number.isNaN(value)) return 'NaN';
    if (value === Infinity) return 'Infinity';
    if (value === -Infinity) return '-Infinity';
    return value;
  }
  if (typeof value === 'bigint') return value.toString();
  if (typeof value === 'symbol') return value.toString();
  if (typeof value === 'function') {
    return `[Function ${(value as { name?: string }).name || 'anonymous'}]`;
  }
  if (value instanceof Date) return value.toISOString();
  if (value instanceof Error) {
    return { name: value.name, message: value.message, stack: value.stack };
  }
  if (typeof Map !== 'undefined' && value instanceof Map) {
    const obj: Record<string, unknown> = {};
    for (const [k, v] of value.entries()) {
      obj[String(k)] = toJsonValue(v, depth + 1);
    }
    return obj;
  }
  if (typeof Set !== 'undefined' && value instanceof Set) {
    return [...value].map((v) => toJsonValue(v, depth + 1));
  }
  if (Array.isArray(value)) {
    return value.map((v) => toJsonValue(v, depth + 1));
  }
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const key of Reflect.ownKeys(value)) {
      try {
        out[String(key)] = toJsonValue((value as Record<string | symbol, unknown>)[key], depth + 1);
      } catch {
        out[String(key)] = '[unreadable]';
      }
    }
    return out;
  }
  return String(value);
}
