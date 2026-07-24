import { dbg } from '../../dist/index.js';

async function fetchUser(id: number) {
  await new Promise((r) => setTimeout(r, 40));
  return { id, name: 'Gurjot' };
}

const user = await dbg(fetchUser(123), 'fetchUser');
dbg(user, 'user');

try {
  await dbg(Promise.reject(new Error('Database connection failed')), 'db');
} catch {
  // rethrown by Lookman — expected
}
