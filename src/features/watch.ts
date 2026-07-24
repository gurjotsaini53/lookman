import { isEnabled } from '../core/config.js';
import { parseCallSite } from '../core/stack.js';
import { emit } from '../formatters/emit.js';

const proxyCache = new WeakMap<object, object>();

function wrap<T extends object>(target: T, path: string): T {
  const cached = proxyCache.get(target);
  if (cached) return cached as T;

  const handler: ProxyHandler<T> = {
    get(obj, prop, receiver) {
      const value = Reflect.get(obj, prop, receiver);
      if (value !== null && typeof value === 'object') {
        const childPath = `${path}.${String(prop)}`;
        return wrap(value as object, childPath);
      }
      return value;
    },
    set(obj, prop, value, receiver) {
      const old = Reflect.get(obj, prop, receiver);
      const result = Reflect.set(obj, prop, value, receiver);
      if (!Object.is(old, value) && isEnabled()) {
        const { file, line } = parseCallSite();
        emit({
          type: 'watch',
          file,
          line,
          path: `${path}.${String(prop)}`,
          from: old,
          to: value,
        });
      }
      // If new value is object, ensure it's wrapped when accessed
      return result;
    },
    deleteProperty(obj, prop) {
      const old = Reflect.get(obj, prop);
      const result = Reflect.deleteProperty(obj, prop);
      if (result && isEnabled()) {
        const { file, line } = parseCallSite();
        emit({
          type: 'watch',
          file,
          line,
          path: `${path}.${String(prop)}`,
          from: old,
          to: undefined,
        });
      }
      return result;
    },
  };

  const proxy = new Proxy(target, handler);
  proxyCache.set(target, proxy);
  // Also map proxy -> itself so nested access doesn't double-wrap incorrectly
  proxyCache.set(proxy, proxy);
  return proxy;
}

export function watchObject<T extends object>(target: T, label = 'obj'): T {
  if (!isEnabled()) return target;
  const { file, line } = parseCallSite();
  console.log(`\n👀 Started watching: ${label} [${file}:${line}]`);
  return wrap(target, label);
}
