import { isEnabled } from '../core/config.js';
import { getType } from '../core/serialize.js';
import { getPromiseTimers, nextPromiseTimerId } from '../core/state.js';
import { colorize } from '../formatters/values.js';
import { emit } from '../formatters/emit.js';
import { getConfig } from '../core/config.js';
import type { CallSite } from '../core/stack.js';

export function handlePromise<T>(
  value: PromiseLike<T>,
  label: string | undefined,
  callSite: CallSite,
): PromiseLike<T> {
  if (!isEnabled()) return value;

  const { file, line, fn } = callSite;
  const timerId = nextPromiseTimerId(file, line, label);
  const timers = getPromiseTimers();
  timers.set(timerId, Date.now());
  const colors = getConfig().colors;

  emit({
    type: 'promise',
    file,
    line,
    fn,
    label,
    valueType: 'Promise',
    value: colorize('dim', '⏳ pending...', colors),
    badge: '',
    icon: ' DBG ',
    isNew: true,
    status: 'pending',
  });

  return Promise.resolve(value).then(
    (res) => {
      const start = timers.get(timerId);
      timers.delete(timerId);
      const duration = start !== undefined ? Date.now() - start : 0;
      if (isEnabled()) {
        emit({
          type: 'promise',
          file,
          line,
          fn,
          label,
          valueType: `Promise -> ${getType(res)}`,
          value: res,
          badge: colorize(
            'bold',
            colorize('green', ` ✅ resolved (+${duration}ms)`, colors),
            colors,
          ),
          durationMs: duration,
          status: 'resolved',
        });
      }
      return res;
    },
    (err: unknown) => {
      const start = timers.get(timerId);
      timers.delete(timerId);
      const duration = start !== undefined ? Date.now() - start : 0;
      if (isEnabled()) {
        emit({
          type: 'promise',
          file,
          line,
          fn,
          label,
          valueType: 'Promise -> Rejected',
          value: err,
          badge: colorize(
            'bold',
            colorize('red', ` ❌ rejected (+${duration}ms)`, colors),
            colors,
          ),
          durationMs: duration,
          status: 'rejected',
        });
      }
      throw err;
    },
  );
}
