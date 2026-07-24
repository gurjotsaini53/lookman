# Troubleshooting

## Package won't import

Lookman 2.x requires Node 18+ and publishes dual ESM/CJS. Use:

```ts
import { dbg } from 'lookman';
```

## Wrong file:line

Ensure you're on 2.x — 1.x filtered stack frames using a `dbg.js` heuristic and often pointed at the library itself.

## Too much output

- Use `dbg.silent`
- Set `dbg.enabled = false` in production
- Prefer JSON format in CI: `LOOKMAN_FORMAT=json`

## `track` missed a property

New keys added after `track()` are not intercepted. Re-run `dbg.track` or assign a new nested object through an already-tracked path. Prefer `watch` when you can replace the reference.

## Colors look wrong

Disable with `dbg.configure({ colors: false })` or `LOOKMAN_COLORS=false`.
