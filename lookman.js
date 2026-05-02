// lookman.js 

const history = new Map();
const counters = new Map();
const timers = new Map();
let indentLevel = 0;

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
  bgRed: '\x1b[41m',
};

const c = (color, text) => `${COLORS[color]}${text}${COLORS.reset}`;

function getType(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return `Array(${value.length})`;
  if (value instanceof Promise) return 'Promise';
  if (value instanceof Error) return `Error`;
  return typeof value;
}

function formatValue(value, type) {
  if (type === 'null' || value === undefined) return c('dim', String(value));
  if (type === 'string') return c('green', `"${value}"`);
  if (type === 'number') return c('yellow', String(value));
  if (type === 'boolean') return c('magenta', String(value));
  if (type.startsWith('Array') || Array.isArray(value)) return c('cyan', JSON.stringify(value));
  if (value instanceof Error) return c('red', `${value.name}: ${value.message}`);
  if (typeof value === 'object' && value !== null) {
    try { return c('cyan', JSON.stringify(value, null, 2)); }
    catch { return c('dim', '[Circular]'); }
  }
  return c('white', String(value));
}

function parseCallSite() {
  const err = new Error();
  const lines = err.stack.split('\n');

  // Walk up the stack to find the caller of dbg()
  const callerLine = lines.find((line, i) => {
    return i > 1 && !line.includes('dbg.js');
  }) || '';

  // Extract file:line:col
  const match = callerLine.match(/at (?:(.+?) \()?(.+?):(\d+):(\d+)\)?/);
  if (!match) return { fn: '?', file: '?', line: '?' };

  const fn = match[1] || '<anonymous>';
  const file = match[2].split('/').slice(-2).join('/'); // last 2 path segments
  const line = match[3];

  return { fn, file, line };
}

function inferName(callSite) {
  // Try to extract variable name from source via stack
  // This is a best-effort heuristic
  return null;
}

let callCount = 0;

export function dbg(value, label) {
  if (dbg.enabled === false) return value;
  callCount++;
  const type = getType(value);
  const { fn, file, line } = parseCallSite();

  // Special handling for Promises
  if (value instanceof Promise) {
    const timeLabel = `promise:${file}:${line}:${label || ''}`;
    timers.set(timeLabel, Date.now());

    // Log initial pending state
    logFormatted({
      file, line, fn, label, type,
      value: c('dim', '⏳ pending...'),
      isNew: true
    });

    return value.then(
      (res) => {
        const duration = Date.now() - timers.get(timeLabel);
        timers.delete(timeLabel);
        logFormatted({
          file, line, fn, label,
          type: `Promise -> ${getType(res)}`,
          value: res,
          badge: c('bold', c('green', ` ✅ resolved (+${duration}ms)`))
        });
        return res;
      },
      (err) => {
        logFormatted({
          file, line, fn, label,
          type: 'Promise -> Rejected',
          value: err,
          badge: c('bold', c('red', ' ❌ rejected'))
        });
        throw err;
      }
    );
  }

  // Serialize for change detection
  let serialized;
  try { serialized = JSON.stringify(value); }
  catch { serialized = String(value); }

  const key = label ? `${file}:${label}` : `${file}:${line}`;
  const prev = history.get(key);
  const changed = prev !== undefined && prev !== serialized;
  const isNew = prev === undefined;
  history.set(key, serialized);

  logFormatted({
    file, line, fn, label, type, value,
    badge: isNew ? '' : changed ? c('bold', c('yellow', ' ⚡ CHANGED')) : c('dim', ' (unchanged)'),
    changed,
    prev
  });

  return value;
}

// Internal helper for consistent formatting
function logFormatted({ file, line, fn, label, type, value, badge = '', changed = false, prev = null, icon = ' DBG ' }) {
  const indent = '  '.repeat(indentLevel);
  const tag = c('bold', c('cyan', icon));
  const loc = c('dim', `${file}:${line}`);
  const fnLabel = fn !== '<anonymous>' ? c('dim', ` in ${fn}()`) : '';
  const nameLabel = label ? c('bold', `${label} `) : '';
  const typeBadge = c('dim', `[${type}]`);

  console.log(`${indent}${tag} ${loc}${fnLabel}${badge}`);
  console.log(`${indent}  ${nameLabel}${typeBadge} ${formatValue(value, type)}`);

  if (changed && prev !== null) {
    let prevVal;
    try { prevVal = JSON.parse(prev); } catch { prevVal = prev; }
    console.log(`${indent}  ${c('dim', 'was:')} ${formatValue(prevVal, getType(prevVal))}`);
  }
  console.log('');
}


dbg.count = (label = 'default') => {
  if (dbg.enabled === false) return;
  const { file, line } = parseCallSite();
  const key = `${file}:${label}`;
  const count = (counters.get(key) || 0) + 1;
  counters.set(key, count);

  const tag = c('bold', c('green', ' COUNT '));
  console.log(`${tag} ${c('dim', `${file}:${line}`)} ${c('bold', label)}: ${c('yellow', count)}`);
  return count;
};

dbg.time = (label = 'default') => {
  if (dbg.enabled === false) return;
  timers.set(label, Date.now());
  const tag = c('bold', c('magenta', ' TIME '));
  console.log(`${tag} ${c('bold', label)} started...`);
};

dbg.timeEnd = (label = 'default') => {
  if (dbg.enabled === false) return;
  const start = timers.get(label);
  const tag = c('bold', c('magenta', ' TIME '));
  if (!start) {
    console.log(`${tag} ${c('red', 'Error:')} timer '${label}' does not exist.`);
    return;
  }
  const duration = Date.now() - start;
  timers.delete(label);
  console.log(`${tag} ${c('bold', label)}: ${c('yellow', `${duration}ms`)}`);
  return duration;
};

dbg.group = (label) => {
  if (dbg.enabled === false) return;
  if (label) console.log(c('bold', `\n🔽 ${label}`));
  indentLevel++;
};

dbg.groupEnd = () => {
  if (dbg.enabled === false) return;
  indentLevel = Math.max(0, indentLevel - 1);
};

dbg.table = (data, label) => {
  if (dbg.enabled === false) return;
  const { file, line } = parseCallSite();
  if (label) console.log(c('bold', `\n TABLE: ${label} (${file}:${line})`));
  console.table(data);
  console.log('');
};

dbg.watch = (target, label = 'obj') => {
  if (dbg.enabled === false) return target;
  const { file, line } = parseCallSite();

  const handler = {
    set(obj, prop, value) {
      const { file, line } = parseCallSite();
      const old = obj[prop];
      const result = Reflect.set(obj, prop, value);

      const tag = c('bold', c('yellow', ' ⚡ WATCH '));
      const loc = c('dim', `[${file}:${line}]`);
      const key = c('cyan', `${label}.${String(prop)}`);

      console.log(`${tag} ${loc} ${key} -> ${formatValue(value, getType(value))} (was: ${formatValue(old, getType(old))})`);
      return result;
    },
    get(obj, prop) {
      const value = Reflect.get(obj, prop);
      if (typeof value === 'object' && value !== null) {
        return new Proxy(value, handler); // Recursive watch
      }
      return value;
    }
  };

  console.log(c('dim', `\n👀 Started watching: ${label} [${file}:${line}]`));
  return new Proxy(target, handler);
};

// Convenience: dbg.log acts as console.log with location
dbg.log = (...args) => {
  if (dbg.enabled === false) return;
  const { fn, file, line } = parseCallSite();
  console.log(c('dim', `[${file}:${line}]`), ...args);
};

dbg.track = (target, label = 'obj') => {
  if (dbg.enabled === false) return target;
  const { file, line } = parseCallSite();
  console.log(c('dim', `\n🎯 Tracking started: ${label} [${file}:${line}] (in-place)`));

  const trackObject = (obj, path) => {
    // Only track actual objects/arrays
    if (!obj || typeof obj !== 'object') return;

    for (let key in obj) {
      let value = obj[key];

      // Deep track existing objects
      if (value && typeof value === 'object') {
        trackObject(value, `${path}.${key}`);
      }

      // Intercept property
      Object.defineProperty(obj, key, {
        get() { return value; },
        set(newValue) {
          if (value === newValue) return;
          const { file, line } = parseCallSite();
          const old = value;
          value = newValue;

          const tag = c('bold', c('yellow', ' ⚡ TRACK '));
          const loc = c('dim', `[${file}:${line}]`);
          const keyPath = c('cyan', `${path}.${key}`);

          console.log(`${tag} ${loc} ${keyPath} -> ${formatValue(newValue, getType(newValue))} (was: ${formatValue(old, getType(old))})`);

          // If new value is an object, track it
          if (newValue && typeof newValue === 'object') {
            trackObject(newValue, `${path}.${key}`);
          }
        },
        enumerable: true,
        configurable: true
      });
    }
  };

  trackObject(target, label);
  return target;
};

dbg.silent = (value, label) => {
  if (dbg.enabled === false) return value;
  const { file, line } = parseCallSite();
  let serialized;
  try { serialized = JSON.stringify(value); } catch { serialized = String(value); }

  const key = label ? `${file}:${label}` : `${file}:${line}`;
  const prev = history.get(key);
  const changed = prev !== undefined && prev !== serialized;
  history.set(key, serialized);

  if (changed || prev === undefined) {
    return dbg(value, label);
  }
  return value;
};

// Reset history (useful in tests)
dbg.reset = () => {
  if (dbg.enabled === false) return;
  history.clear();
};

// Enable by default, user can manually disable it for production
dbg.enabled = true;
