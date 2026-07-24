# Change detection

## What it does

Repeated `dbg(value, label)` calls compare a robust fingerprint of the value and mark **CHANGED** or **unchanged**. When possible, a structured diff is printed.

## Why

Hot paths and render loops produce noisy logs. Change badges and `dbg.silent` cut the noise.

## Example

```ts
dbg(count, 'count'); // first
dbg(count + 1, 'count'); // ⚡ CHANGED + diff
```

## Serialization

Fingerprints handle `undefined`, `NaN`, `Infinity`, `BigInt`, `Date`, `Error`, `Map`, `Set`, functions/symbols (as tags), and circular references.

## Edge cases

- Labels scope history per file; without a label, history keys use `file:line`.
- Large objects cost more to fingerprint — disable Lookman in production.
- `dbg.diff(prev, curr)` is available for explicit diffs.
