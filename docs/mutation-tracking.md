# Mutation tracking

## `dbg.watch(target, label?)`

Returns a **Proxy**. Deep gets are wrapped with `WeakMap` caching (no new Proxy every access). Logs sets and deletes with full paths.

```ts
const user = dbg.watch({ name: 'Gurjot', age: 24 }, 'user');
user.age = 25;
```

```text
⚡ WATCH

user.age
24 → 25
```

## `dbg.track(target, label?)`

Mutates the object **in place** with `Object.defineProperty`. Use when you cannot replace the reference.

```ts
const state = { user: { name: 'Gurjot' } };
dbg.track(state, 'state');
state.user.name = 'John';
```

## Limitations

- Non-configurable properties cannot be redefined — nested values may still be tracked.
- Accessor properties (getters/setters) are left alone.
- Newly added properties after the initial `track` scan are not automatically intercepted unless assigned through a tracked setter that receives a new object.
- `watch` changes identity (Proxy); `track` preserves identity.

## Edge cases

Circular structures are handled via a `WeakSet` of already-tracked objects.
