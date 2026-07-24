/**
 * Minimal Express-style illustration (no Express dependency required).
 * Shows where Lookman fits in a request handler.
 */
import { dbg } from '../../dist/index.js';

type Req = { method: string; url: string };
type Res = { statusCode: number; body?: unknown };

async function handler(req: Req, res: Res) {
  dbg.once('server-ready', 'handler invoked');
  dbg.log(req.method, req.url);

  const data = await dbg(
    Promise.resolve({ ok: true, path: req.url }),
    'response',
  );

  res.statusCode = 200;
  res.body = data;
  return res;
}

const res = await handler({ method: 'GET', url: '/health' }, { statusCode: 0 });
dbg(res, 'res');
