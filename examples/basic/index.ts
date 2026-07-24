import { dbg } from '../../dist/index.js';

dbg.configure({ colors: true });

const user = { id: 1, name: 'Gurjot', age: 24 };
dbg(user, 'user');

dbg.count('requests');
dbg.count('requests');

dbg.time('work');
await new Promise((r) => setTimeout(r, 20));
dbg.timeEnd('work');

dbg.group('checkout');
dbg(99.5, 'total');
dbg.groupEnd();

dbg.assert(user.age >= 18, 'User must be an adult');
dbg.once('boot', 'Lookman example started');
