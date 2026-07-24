import { isEnabled } from '../core/config.js';
import { parseCallSite } from '../core/stack.js';
import { emit } from '../formatters/emit.js';

export function assertCondition(condition: unknown, message?: string): boolean {
  if (!isEnabled()) return Boolean(condition);
  if (condition) return true;

  const { file, line } = parseCallSite();
  emit({
    type: 'assert',
    file,
    line,
    message: message ?? 'Assertion failed',
  });
  return false;
}
