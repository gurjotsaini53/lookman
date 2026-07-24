import { isEnabled } from '../core/config.js';
import { parseCallSite } from '../core/stack.js';
import { emit } from '../formatters/emit.js';

const tracked = new WeakSet<object>();

function trackObject(obj: object, path: string): void {
  if (!obj || typeof obj !== 'object') return;
  if (tracked.has(obj)) return;
  tracked.add(obj);

  const keys = Reflect.ownKeys(obj);
  for (const key of keys) {
    let descriptor: PropertyDescriptor | undefined;
    try {
      descriptor = Object.getOwnPropertyDescriptor(obj, key);
    } catch {
      continue;
    }
    if (!descriptor) continue;

    // Skip non-configurable or accessor-only without being able to wrap safely
    if (!descriptor.configurable) {
      const existing = (obj as Record<string | symbol, unknown>)[key];
      if (existing && typeof existing === 'object') {
        trackObject(existing, `${path}.${String(key)}`);
      }
      continue;
    }

    if (descriptor.get || descriptor.set) {
      // Leave accessors alone; still track nested current value if readable
      try {
        const current = Reflect.get(obj, key);
        if (current && typeof current === 'object') {
          trackObject(current as object, `${path}.${String(key)}`);
        }
      } catch {
        /* ignore */
      }
      continue;
    }

    let value = descriptor.value;
    if (value && typeof value === 'object') {
      trackObject(value as object, `${path}.${String(key)}`);
    }

    try {
      Object.defineProperty(obj, key, {
        get() {
          return value;
        },
        set(newValue: unknown) {
          if (Object.is(value, newValue)) return;
          const old = value;
          value = newValue;
          if (isEnabled()) {
            const { file, line } = parseCallSite();
            emit({
              type: 'track',
              file,
              line,
              path: `${path}.${String(key)}`,
              from: old,
              to: newValue,
            });
          }
          if (newValue && typeof newValue === 'object') {
            trackObject(newValue as object, `${path}.${String(key)}`);
          }
        },
        enumerable: descriptor.enumerable ?? true,
        configurable: true,
      });
    } catch {
      // Cannot redefine — skip
    }
  }
}

/**
 * Best-effort in-place tracking via defineProperty.
 * Does not intercept newly added properties after the initial scan unless
 * assigned through an already-tracked setter that receives a new object.
 */
export function trackTarget<T extends object>(target: T, label = 'obj'): T {
  if (!isEnabled()) return target;
  const { file, line } = parseCallSite();
  console.log(`\n🎯 Tracking started: ${label} [${file}:${line}] (in-place)`);
  trackObject(target, label);
  return target;
}
