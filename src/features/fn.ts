import { isEnabled } from '../core/config.js';
import { parseCallSite } from '../core/stack.js';
import { isThenable } from '../core/serialize.js';
import { emit } from '../formatters/emit.js';

type AnyFn = (...args: any[]) => any;

export function traceFn<T extends AnyFn>(fn: T, label?: string): T {
  const name = label ?? (fn.name || 'anonymous');

  const wrapped = function (this: unknown, ...args: Parameters<T>): ReturnType<T> {
    if (!isEnabled()) {
      return fn.apply(this, args) as ReturnType<T>;
    }

    const { file, line } = parseCallSite();
    const start = Date.now();

    emit({
      type: 'fn',
      file,
      line,
      label: name,
      args,
      status: 'running',
    });

    try {
      const result = fn.apply(this, args) as ReturnType<T>;

      if (isThenable(result)) {
        return Promise.resolve(result).then(
          (res) => {
            if (isEnabled()) {
              emit({
                type: 'fn',
                file,
                line,
                label: name,
                value: res,
                durationMs: Date.now() - start,
                status: 'completed',
              });
            }
            return res;
          },
          (err: unknown) => {
            if (isEnabled()) {
              emit({
                type: 'fn',
                file,
                line,
                label: name,
                value: err,
                durationMs: Date.now() - start,
                status: 'error',
              });
            }
            throw err;
          },
        ) as ReturnType<T>;
      }

      emit({
        type: 'fn',
        file,
        line,
        label: name,
        value: result,
        durationMs: Date.now() - start,
        status: 'completed',
      });
      return result;
    } catch (err) {
      emit({
        type: 'fn',
        file,
        line,
        label: name,
        value: err,
        durationMs: Date.now() - start,
        status: 'error',
      });
      throw err;
    }
  } as T;

  try {
    Object.defineProperty(wrapped, 'name', { value: name, configurable: true });
  } catch {
    /* ignore */
  }

  return wrapped;
}
