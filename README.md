# Lookman

A lightweight, **breakpoint-free** JavaScript debugging utility. Drop `dbg()` anywhere in your code to inspect values with color-coded output, change detection, async tracking, and more — all from a single import.

---

## Installation

```bash
# Copy dbg.js into your project
cp lookman.js src/utils/lookman.js
```

No npm package required. Just import and go.

---

## Quick Start

```js
import { dbg } from './lookman.js';

const user = { name: 'Alice', age: 30 };
dbg(user, 'user');
// Prints: file, line, function name, type, and formatted value
```

---

## Features

- 🎨 **Color-coded output** — types, values, and status are color-differentiated in the terminal
- 🔁 **Change detection** — automatically highlights when a value changes between calls
- ⏳ **Promise tracking** — logs pending, resolved, and rejected states with timing
- 👀 **Reactive watching** — intercepts mutations on any object via `Proxy`
- 🎯 **In-place tracking** — observe property changes without replacing the original object
- 🔕 **Silent mode** — only outputs when a value changes
- 📊 **Table view** — pretty-print arrays and objects
- ⏱️ **Timers** — measure elapsed time between any two points
- 🔢 **Counters** — track how many times a code path runs
- 📦 **Groups** — indent related logs together
- 🛑 **Production Safe** — easily disable globally in production

---

## API Reference

### `dbg(value, label?)`

The core function. Logs the value with its type, source location (file, line, function), and change status.

```js
dbg(42);
dbg(response, 'apiResponse');
```

**Returns** the original value, so it can be used inline:

```js
const result = dbg(compute(), 'result');
```

---

### `dbg.count(label?)`

Counts how many times this line has been called.

```js
dbg.count('loop');
```

---

### `dbg.time(label?)` / `dbg.timeEnd(label?)`

Start and stop a named timer. Prints elapsed milliseconds.

```js
dbg.time('fetchUsers');
await getUsers();
dbg.timeEnd('fetchUsers'); // → fetchUsers: 142ms
```

---

### `dbg.group(label?)` / `dbg.groupEnd()`

Indent subsequent logs within a labeled group.

```js
dbg.group('Auth Flow');
dbg(token, 'token');
dbg(user, 'user');
dbg.groupEnd();
```

---

### `dbg.table(data, label?)`

Pretty-print arrays or objects using `console.table`.

```js
dbg.table(users, 'users');
```

---

### `dbg.watch(target, label?)`

Wraps an object in a `Proxy` and logs every property mutation. Supports deep/nested objects.

```js
const state = dbg.watch({ count: 0 }, 'state');
state.count = 1; // → ⚡ WATCH [file:line] state.count -> 1 (was: 0)
```

> **Note:** Returns a new proxied object — reassign your variable to the return value.

---

### `dbg.track(target, label?)`

Like `dbg.watch` but mutates the object **in place** using `Object.defineProperty`. Use when you can't replace the original reference.

```js
const config = { debug: false };
dbg.track(config, 'config');
config.debug = true; // → ⚡ TRACK [file:line] config.debug -> true (was: false)
```

---

### `dbg.silent(value, label?)`

Only logs when a value is new or has changed since the last call. Useful inside loops or hot paths.

```js
dbg.silent(status, 'status'); // logs only on first call or when status changes
```

---

### `dbg.log(...args)`

A drop-in for `console.log` that automatically prepends `[file:line]` call-site info.

```js
dbg.log('Server started on port', port);
```

---

### `dbg.reset()`

Clears the internal value history. Useful in tests to reset change-detection state between runs.

```js
dbg.reset();
```

---

### `dbg.enabled`

Globally enable or disable all debugging features. Set this flag to `false` in production to ensure zero performance overhead.

```js
// Disable all lookman output
dbg.enabled = false;
```

---

## Promise Support

`dbg()` automatically detects Promises and logs all three lifecycle stages:

```js
const data = await dbg(fetchUser(id), 'user');
// → ⏳ pending...
// → ✅ resolved (+88ms)  { id: 1, name: 'Alice' }
```

If the promise rejects, the error is logged and re-thrown so it doesn't swallow exceptions.

---

## Change Detection

Every call to `dbg()` compares the current value to the last seen value at the same location/label. Changes are highlighted automatically:

```
 DBG  src/app.js:42 in render()  ⚡ CHANGED
  count [number] 5
  was: 4
```

---

## License

MIT
