# Performance

## Goal

When Lookman is **disabled**, overhead should be minimal: return the value / no-op without stack traces, serialization, or Proxy allocation.

## Measuring

```bash
npm run bench
```

The bench compares:

- `console.log` primitives
- Lookman enabled
- Lookman disabled
- Object / large object logging

## Guidance

- Prefer `dbg.silent` on hot loops when you only care about changes.
- Prefer labels over relying solely on line numbers when code moves.
- Never leave verbose mutation tracking on in production traffic paths.
- Do not make absolute claims from micro-benchmarks alone.
