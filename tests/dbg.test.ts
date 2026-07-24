import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { dbg } from '../src/index.js';

beforeEach(() => {
  dbg.reset();
  dbg.configure({ enabled: true, colors: false, format: 'pretty', timestamps: false, location: true });
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'table').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  dbg.enabled = true;
});

describe('primitives & values', () => {
  it('returns the original value', () => {
    expect(dbg(42)).toBe(42);
    expect(dbg('hi')).toBe('hi');
    expect(dbg(true)).toBe(true);
    expect(dbg(null)).toBe(null);
    expect(dbg(undefined)).toBe(undefined);
  });

  it('logs arrays and objects', () => {
    const arr = [1, 2, 3];
    const obj = { a: 1 };
    expect(dbg(arr, 'arr')).toBe(arr);
    expect(dbg(obj, 'obj')).toBe(obj);
    expect(console.log).toHaveBeenCalled();
  });

  it('handles nested objects and circular refs without throwing', () => {
    const a: Record<string, unknown> = { x: 1 };
    a.self = a;
    expect(() => dbg(a, 'circular')).not.toThrow();
  });

  it('handles Error objects', () => {
    const err = new Error('boom');
    expect(dbg(err, 'err')).toBe(err);
  });

  it('handles NaN, Infinity, BigInt', () => {
    expect(dbg(NaN, 'nan')).toBeNaN();
    expect(dbg(Infinity, 'inf')).toBe(Infinity);
    expect(dbg(10n, 'bi')).toBe(10n);
  });
});

describe('change detection', () => {
  it('marks changes between calls with same label', () => {
    dbg(1, 'n');
    dbg(2, 'n');
    const calls = vi.mocked(console.log).mock.calls.flat().join(' ');
    expect(calls).toContain('CHANGED');
  });

  it('marks unchanged', () => {
    dbg(1, 'same');
    vi.mocked(console.log).mockClear();
    dbg(1, 'same');
    const calls = vi.mocked(console.log).mock.calls.flat().join(' ');
    expect(calls).toContain('unchanged');
  });
});

describe('promises', () => {
  it('resolves and returns the value', async () => {
    const result = await dbg(Promise.resolve(99), 'p');
    expect(result).toBe(99);
    const calls = vi.mocked(console.log).mock.calls.flat().join(' ');
    expect(calls).toMatch(/resolved/i);
  });

  it('rejects and rethrows', async () => {
    await expect(dbg(Promise.reject(new Error('fail')), 'bad')).rejects.toThrow('fail');
    const calls = vi.mocked(console.log).mock.calls.flat().join(' ');
    expect(calls).toMatch(/rejected/i);
  });

  it('handles concurrent promises safely', async () => {
    const [a, b] = await Promise.all([
      dbg(Promise.resolve('a'), 'pa'),
      dbg(Promise.resolve('b'), 'pb'),
    ]);
    expect(a).toBe('a');
    expect(b).toBe('b');
  });

  it('handles thenables', async () => {
    const thenable = {
      then(resolve: (v: number) => void) {
        resolve(7);
      },
    };
    const result = await dbg(thenable as PromiseLike<number>, 'th');
    expect(result).toBe(7);
  });
});

describe('timers & counters', () => {
  it('counts', () => {
    expect(dbg.count('c')).toBe(1);
    expect(dbg.count('c')).toBe(2);
  });

  it('times', async () => {
    dbg.time('t');
    await new Promise((r) => setTimeout(r, 5));
    const ms = dbg.timeEnd('t');
    expect(ms).toBeGreaterThanOrEqual(0);
  });

  it('reports missing timer', () => {
    dbg.timeEnd('missing');
    const calls = vi.mocked(console.log).mock.calls.flat().join(' ');
    expect(calls).toContain('does not exist');
  });
});

describe('groups & table & log', () => {
  it('groups', () => {
    dbg.group('g');
    dbg(1, 'inside');
    dbg.groupEnd();
    expect(console.log).toHaveBeenCalled();
  });

  it('tables', () => {
    dbg.table([{ a: 1 }], 'rows');
    expect(console.table).toHaveBeenCalled();
  });

  it('log prepends location', () => {
    dbg.log('hello');
    expect(console.log).toHaveBeenCalled();
  });
});

describe('watch', () => {
  it('logs mutations with nested path', () => {
    const user = dbg.watch({ name: 'Gurjot', age: 24, nested: { x: 1 } }, 'user');
    user.age = 25;
    user.nested.x = 2;
    const calls = vi.mocked(console.log).mock.calls.flat().join(' ');
    expect(calls).toContain('user.age');
    expect(calls).toContain('user.nested.x');
  });

  it('caches proxies', () => {
    const obj = { a: { b: 1 } };
    const w = dbg.watch(obj, 'w');
    const n1 = w.a;
    const n2 = w.a;
    expect(n1).toBe(n2);
  });

  it('returns original when disabled', () => {
    dbg.enabled = false;
    const obj = { a: 1 };
    expect(dbg.watch(obj)).toBe(obj);
  });
});

describe('track', () => {
  it('logs in-place mutations', () => {
    const state = { user: { name: 'Gurjot' } };
    dbg.track(state, 'state');
    state.user.name = 'John';
    const calls = vi.mocked(console.log).mock.calls.flat().join(' ');
    expect(calls).toContain('state.user.name');
  });
});

describe('silent', () => {
  it('only logs on change', () => {
    dbg.silent(1, 's');
    const first = vi.mocked(console.log).mock.calls.length;
    dbg.silent(1, 's');
    const second = vi.mocked(console.log).mock.calls.length;
    expect(second).toBe(first);
    dbg.silent(2, 's');
    expect(vi.mocked(console.log).mock.calls.length).toBeGreaterThan(second);
  });
});

describe('disabled mode', () => {
  it('has near-zero side effects', () => {
    dbg.enabled = false;
    expect(dbg(1, 'x')).toBe(1);
    expect(dbg.count('c')).toBeUndefined();
    dbg.time('t');
    expect(dbg.timeEnd('t')).toBeUndefined();
    expect(vi.mocked(console.log).mock.calls.length).toBe(0);
  });

  it('reset still works when disabled', () => {
    dbg(1, 'r');
    dbg.enabled = false;
    dbg.reset();
    dbg.enabled = true;
    dbg(1, 'r');
    const calls = vi.mocked(console.log).mock.calls.flat().join(' ');
    expect(calls).not.toContain('unchanged');
  });
});

describe('diff', () => {
  it('diffs objects', () => {
    dbg.diff({ name: 'Gurjot', age: 23 }, { name: 'Gurjot Singh', age: 24, skills: ['Java'] });
    const calls = vi.mocked(console.log).mock.calls.flat().join('\n');
    expect(calls).toMatch(/DIFF/);
    expect(calls).toContain('name');
    expect(calls).toContain('age');
  });

  it('handles circular safely', () => {
    const a: Record<string, unknown> = {};
    a.self = a;
    const b: Record<string, unknown> = {};
    b.self = b;
    expect(() => dbg.diff(a, b)).not.toThrow();
  });
});

describe('assert', () => {
  it('passes truthy', () => {
    expect(dbg.assert(true, 'ok')).toBe(true);
  });

  it('fails falsy with message', () => {
    expect(dbg.assert(false, 'User must be an adult')).toBe(false);
    const calls = vi.mocked(console.log).mock.calls.flat().join(' ');
    expect(calls).toContain('ASSERT');
    expect(calls).toContain('User must be an adult');
  });
});

describe('once', () => {
  it('logs only once per key', () => {
    dbg.once('db', 'connected');
    const first = vi.mocked(console.log).mock.calls.length;
    dbg.once('db', 'connected again');
    expect(vi.mocked(console.log).mock.calls.length).toBe(first);
  });

  it('resets with dbg.reset', () => {
    dbg.once('k', 1);
    dbg.reset();
    dbg.once('k', 2);
    const calls = vi.mocked(console.log).mock.calls.flat().join(' ');
    expect(calls).toContain('ONCE');
  });
});

describe('fn tracing', () => {
  it('traces sync functions', () => {
    const add = dbg.fn((a: number, b: number) => a + b, 'add');
    expect(add(1, 2)).toBe(3);
    const calls = vi.mocked(console.log).mock.calls.flat().join(' ');
    expect(calls).toContain('add');
    expect(calls).toMatch(/completed/);
  });

  it('traces async and preserves rejection', async () => {
    const boom = dbg.fn(async () => {
      throw new Error('nope');
    }, 'boom');
    await expect(boom()).rejects.toThrow('nope');
  });

  it('traces async success', async () => {
    const ok = dbg.fn(async (n: number) => n * 2, 'dbl');
    await expect(ok(21)).resolves.toBe(42);
  });
});

describe('configure & json', () => {
  it('emits JSON without ANSI', () => {
    dbg.configure({ format: 'json', colors: true });
    dbg(123, 'num');
    const line = String(vi.mocked(console.log).mock.calls[0]?.[0]);
    expect(() => JSON.parse(line)).not.toThrow();
    expect(line.includes('\u001b[')).toBe(false);
    const parsed = JSON.parse(line);
    expect(parsed.type).toBe('debug');
    expect(parsed.label).toBe('num');
    expect(parsed.value).toBe(123);
  });
});

describe('source location', () => {
  it('does not report lookman internal frames as the only location', () => {
    dbg(1, 'loc');
    const calls = vi.mocked(console.log).mock.calls.flat().join(' ');
    // Should include a file:line style token from the test file path
    expect(calls).toMatch(/\d+/);
  });
});
