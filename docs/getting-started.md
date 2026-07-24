# Getting started

## Install

```bash
npm install lookman
```

## Import

```ts
import { dbg } from 'lookman';
```

CommonJS:

```js
const { dbg } = require('lookman');
```

## First log

```ts
const user = { id: 1, name: 'Gurjot' };
dbg(user, 'user');
```

Lookman prints the call site, label, type, and formatted value, then **returns the same value** so you can use it inline.

## Disable for production

```ts
if (process.env.NODE_ENV === 'production') {
  dbg.enabled = false;
}
```

Or:

```bash
LOOKMAN_ENABLED=false node app.js
```

## Next steps

- [Core API](./core-api.md)
- [Promises](./promises.md)
- [Mutation tracking](./mutation-tracking.md)
