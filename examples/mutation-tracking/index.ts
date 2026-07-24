import { dbg } from '../../dist/index.js';

const watched = dbg.watch({ name: 'Gurjot', age: 24, nested: { role: 'dev' } }, 'user');
watched.age = 25;
watched.nested.role = 'engineer';

const state = { user: { name: 'Gurjot' } };
dbg.track(state, 'state');
state.user.name = 'John';
