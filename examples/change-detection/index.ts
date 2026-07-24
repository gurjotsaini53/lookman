import { dbg } from '../../dist/index.js';

let status = 'idle';
dbg(status, 'status');
status = 'loading';
dbg(status, 'status');
status = 'loading';
dbg.silent(status, 'status'); // unchanged → silent
status = 'ready';
dbg.silent(status, 'status');

dbg.diff(
  { name: 'Gurjot', age: 23 },
  { name: 'Gurjot Singh', age: 24, skills: ['Java'] },
);
