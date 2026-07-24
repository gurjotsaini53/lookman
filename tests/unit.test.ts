import { describe, expect, it } from 'vitest';
import { computeDiff, formatDiffLines } from '../src/features/diff.js';
import { fingerprint, getType, isThenable } from '../src/core/serialize.js';
import { parseCallSite } from '../src/core/stack.js';

describe('computeDiff', () => {
  it('detects added removed changed', () => {
    const changes = computeDiff(
      { name: 'A', age: 1, gone: true },
      { name: 'B', age: 1, skills: ['js'] },
    );
    const kinds = Object.fromEntries(changes.map((c) => [c.path, c.kind]));
    expect(kinds.name).toBe('changed');
    expect(kinds.gone).toBe('removed');
    expect(kinds.skills).toBe('added');
  });

  it('diffs arrays', () => {
    const changes = computeDiff([1, 2], [1, 3, 4]);
    expect(changes.some((c) => c.path === '[1]' && c.kind === 'changed')).toBe(true);
    expect(changes.some((c) => c.path === '[2]' && c.kind === 'added')).toBe(true);
  });

  it('formatDiffLines produces +/- lines', () => {
    const lines = formatDiffLines(computeDiff({ a: 1 }, { a: 2 }), false);
    expect(lines.join('\n')).toContain('- 1');
    expect(lines.join('\n')).toContain('+ 2');
  });
});

describe('serialize', () => {
  it('fingerprints specials distinctly', () => {
    expect(fingerprint(undefined)).not.toBe(fingerprint(null));
    expect(fingerprint(NaN)).toBe('n:NaN');
    expect(fingerprint(10n)).toBe('bi:10');
    expect(fingerprint(new Date('2020-01-01T00:00:00.000Z'))).toContain('date:');
  });

  it('handles circular', () => {
    const o: Record<string, unknown> = {};
    o.o = o;
    expect(fingerprint(o)).toContain('[Circular]');
  });

  it('getType and isThenable', () => {
    expect(getType([])).toMatch(/Array/);
    expect(isThenable(Promise.resolve())).toBe(true);
    expect(isThenable({ then() {} })).toBe(true);
    expect(isThenable(1)).toBe(false);
  });
});

describe('stack', () => {
  it('returns a call site', () => {
    const site = parseCallSite();
    expect(site.file).toBeTruthy();
    expect(site.line).toBeTruthy();
  });
});
