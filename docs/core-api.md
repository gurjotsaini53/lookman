# Core API

## `dbg(value, label?)`

Logs a value with source location, inferred type, and change detection.

**Returns** the original value (including Promises).

```ts
const n = dbg(42, 'answer');
```

## `dbg.count(label?)`

Increments and prints a counter keyed by file + label.

## `dbg.time(label?)` / `dbg.timeEnd(label?)`

Named timers. Returns elapsed ms from `timeEnd`.

## `dbg.group(label?)` / `dbg.groupEnd()`

Indents subsequent Lookman output.

## `dbg.table(data, label?)`

Wraps `console.table` with an optional label and location.

## `dbg.log(...args)`

Like `console.log`, with `[file:line]` prefix when location is enabled.

## `dbg.silent(value, label?)`

Updates history always; prints only when the value is new or changed.

## `dbg.reset()`

Clears history, counters, timers, promise timers, and once-keys. Works even when disabled.

## `dbg.enabled`

Boolean switch. Prefer `dbg.configure({ enabled })` for other options.

## `dbg.configure(options)`

See [configuration.md](./configuration.md).

## `dbg.diff` / `dbg.assert` / `dbg.once` / `dbg.fn` / `dbg.watch` / `dbg.track`

Covered in feature-specific docs.
