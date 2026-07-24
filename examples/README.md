# Examples

From the repo root:

```bash
npm install
npm run build
node examples/basic/index.ts
node examples/promises/index.ts
node examples/change-detection/index.ts
node examples/mutation-tracking/index.ts
node examples/express/index.ts
node examples/nextjs/index.ts
node examples/react/index.ts
node examples/typescript/index.ts
```

Examples import the built package from `../../dist/index.js` (Node 22+ runs TypeScript example files natively enough for these demos; if your Node version rejects `.ts`, rename to `.mjs` or run via `npx tsx`).
