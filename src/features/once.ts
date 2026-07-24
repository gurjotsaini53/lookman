import { isEnabled } from '../core/config.js';
import { getOnceKeys } from '../core/state.js';
import { parseCallSite } from '../core/stack.js';
import { getType } from '../core/serialize.js';
import { emit } from '../formatters/emit.js';

export function onceLog<T>(key: string, value: T, label?: string): T {
  if (!isEnabled()) return value;

  const keys = getOnceKeys();
  if (keys.has(key)) return value;
  keys.add(key);

  const { file, line, fn } = parseCallSite();
  emit({
    type: 'once',
    file,
    line,
    fn,
    label: label ?? key,
    value,
    valueType: getType(value),
    icon: ' ONCE ',
    isNew: true,
  });
  return value;
}
