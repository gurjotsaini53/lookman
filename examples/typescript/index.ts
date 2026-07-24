import { dbg } from '../../dist/index.js';

interface User {
  id: number;
  name: string;
}

async function loadUser(id: number): Promise<User> {
  return { id, name: 'Gurjot' };
}

const traced = dbg.fn(loadUser, 'loadUser');
const user: User = await traced(1);
const same: User = dbg(user, 'user');
dbg.assert(same.id > 0, 'id must be positive');
