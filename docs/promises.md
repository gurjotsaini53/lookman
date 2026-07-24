# Promise debugging

## What it does

When you pass a Promise (or thenable) to `dbg()`, Lookman logs pending, then resolved or rejected with duration.

## Why

Async bugs often need timing and failure visibility without wrapping every call in try/catch just for logging.

## Example

```ts
const user = await dbg(fetchUser(123), 'fetchUser');
```

```text
 DBG  users.ts:42 in getUser()
  fetchUser [Promise] ⏳ pending...

 DBG  users.ts:42 in getUser() ✅ resolved (+142ms)
  fetchUser [Promise -> Object] { ... }
```

On rejection, Lookman logs the error and **rethrows** — it never swallows failures.

## Edge cases

- Concurrent promises use unique internal timer IDs (labels do not collide).
- Thenables are supported via `Promise.resolve`.
- When `dbg.enabled = false`, the original thenable is returned untouched.
