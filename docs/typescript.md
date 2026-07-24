# TypeScript

Lookman ships with generated `.d.ts` files.

```ts
import { dbg } from 'lookman';

interface User {
  id: number;
  name: string;
}

const user: User = { id: 1, name: 'Gurjot' };
const same: User = dbg(user, 'user'); // type preserved

const watched: User = dbg.watch(user, 'user');
const traced = dbg.fn(async (id: number) => ({ id }), 'load');
```

Generics flow through `dbg`, `silent`, `watch`, `track`, `once`, and `fn`.
