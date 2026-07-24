```text
 _                 _
| | ___   ___ | | ___ __ ___   __ _ _ __
| |/ _ \ / _ \| |/ / '_ ` _ \ / _` | '_ \
| | (_) | (_) |   <| | | | | | (_| | | | |
|_|\___/ \___/|_|\_\_| |_| |_|\__,_|_| |_|
```

# Lookman

### A smarter `console.log()` for JavaScript.

Debug values, detect changes, trace async operations, track mutations, and measure performance.

```bash
npm install lookman
```

```ts
import { dbg } from 'lookman';

const user = dbg(await fetchUser(123), 'user');
```

```text
 DBG  users/service.ts:42 in getUser()
  user [Object] {
    "id": 123,
    "name": "Gurjot"
  }
```

---

## Why Lookman?

`console.log` tells you a value. It does not tell you **what changed**, **where it changed**, **who changed it**, or **how long an async call took**.

Lookman sits between ad-hoc logging and full observability:

```text
console.log()
      ↓
Lookman          ← you are here
      ↓
Structured Logging
      ↓
Full Observability Platforms
```

It is a **developer debugging and runtime inspection toolkit** — not a replacement for Pino, Winston, or Sentry.

---

## Comparison

| Feature           | console.log | Lookman |
| ----------------- | ----------- | ------- |
| Value logging     | Yes         | Yes     |
| Source location   | No          | Yes     |
| Change detection  | No          | Yes     |
| Promise tracking  | No          | Yes     |
| Execution timing  | No          | Yes     |
| Mutation tracking | No          | Yes     |
| Counters          | No          | Yes     |
| Object watching   | No          | Yes     |
| Structured JSON   | No          | Yes     |

---

## Quick start

```ts
import { dbg } from 'lookman';

// Inline value inspection (returns the same value)
const total = dbg(cart.reduce((s, i) => s + i.price, 0), 'total');

// Promises
const user = await dbg(fetchUser(id), 'user');

// Mutations — who changed it?
const state = dbg.track({ user: { name: 'Gurjot' } }, 'state');
state.user.name = 'John';
// ⚡ TRACK  state.user.name  "Gurjot" → "John"
```

Disable in production:

```ts
dbg.enabled = false;
// or LOOKMAN_ENABLED=false
```

---

## Core API

| API | Purpose |
| --- | --- |
| `dbg(value, label?)` | Log value + location + change detection |
| `dbg.count(label?)` | Call counter |
| `dbg.time` / `dbg.timeEnd` | Elapsed timing |
| `dbg.group` / `dbg.groupEnd` | Indent related logs |
| `dbg.table(data, label?)` | `console.table` with location |
| `dbg.watch(obj, label?)` | Proxy-based deep mutation watch |
| `dbg.track(obj, label?)` | In-place deep mutation track |
| `dbg.log(...args)` | `console.log` with location |
| `dbg.silent(value, label?)` | Log only when value changes |
| `dbg.diff(prev, curr)` | Structured value diff |
| `dbg.assert(cond, msg?)` | Debug assertion |
| `dbg.once(key, value, label?)` | Log once per key |
| `dbg.fn(fn, label?)` | Trace sync/async functions |
| `dbg.configure(options)` | Runtime configuration |
| `dbg.reset()` | Clear history / counters / once keys |
| `dbg.enabled` | Global on/off |

Full reference: [docs/core-api.md](./docs/core-api.md)

---

## Mutation hook

> **Your JavaScript object changed. But who changed it?**

```ts
const state = dbg.track({ user: { name: 'Gurjot' } }, 'state');
state.user.name = 'John';
```

```text
⚡ TRACK

state.user.name
"Gurjot" → "John"

Location:
app.ts:12
```

---

## Configuration

```ts
dbg.configure({
  enabled: true,
  colors: true,
  timestamps: false,
  location: true,
  format: 'pretty', // or 'json'
});
```

Environment variables: `LOOKMAN_ENABLED`, `LOOKMAN_FORMAT`, `LOOKMAN_COLORS`, `LOOKMAN_TIMESTAMPS`, `LOOKMAN_LOCATION`.

See [docs/configuration.md](./docs/configuration.md).

---

## TypeScript

```ts
const user = dbg(user); // type preserved
const watched = dbg.watch(user, 'user'); // same type
```

---

## Framework notes

Works in Node.js 18+, Bun, and modern bundlers (Vite, Next.js, React apps) when running in Node or browser-like environments that provide `console` and `Error.stack`. Browser support uses the same API; colors depend on the console.

---

## Performance

When disabled, Lookman returns early before stack parsing, serialization, or Proxy work.

Run local micro-benchmarks:

```bash
npm run bench
```

Do not treat micro-benchmarks as absolute truth — measure in your app.

---

## Documentation

- [Getting started](./docs/getting-started.md)
- [Core API](./docs/core-api.md)
- [Promises](./docs/promises.md)
- [Change detection](./docs/change-detection.md)
- [Mutation tracking](./docs/mutation-tracking.md)
- [Performance](./docs/performance.md)
- [Configuration](./docs/configuration.md)
- [JSON output](./docs/json-output.md)
- [TypeScript](./docs/typescript.md)
- [Troubleshooting](./docs/troubleshooting.md)
- [Contributing](./docs/contributing.md)

Examples live in [`examples/`](./examples/).

---

## License

MIT © Gurjot Saini
