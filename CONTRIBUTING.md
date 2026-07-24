# Contributing to Lookman

Thanks for helping make Lookman better.

## Development

```bash
npm install
npm run typecheck
npm test
npm run lint
npm run build
```

## Guidelines

1. Preserve the public `dbg` API unless a breaking change is intentional and documented.
2. Keep zero runtime dependencies.
3. Disabled mode must stay extremely cheap — early-return before stack/serialize/Proxy work.
4. Never swallow application errors (especially Promise rejections and `dbg.fn` throws).
5. Add tests for every bug fix and new feature.
6. Prefer small, focused pull requests.

## Pull requests

- Describe the problem and solution.
- Include test coverage.
- Update docs/README when the public API changes.
- Do not commit secrets, `node_modules`, or build artifacts beyond what's needed.

## Code of conduct

Please follow [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).
