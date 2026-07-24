/**
 * Illustrative Next.js-style server helper.
 * Run with: npx tsx examples/nextjs/index.ts
 */
import { dbg } from '../../dist/index.js';

export async function getServerSideProps() {
  const props = await dbg(
    Promise.resolve({ title: 'Lookman + Next.js' }),
    'props',
  );
  return { props };
}

const result = await getServerSideProps();
dbg(result, 'ssr');
