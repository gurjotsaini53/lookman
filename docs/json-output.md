# JSON output

```ts
dbg.configure({ format: 'json', colors: false });
dbg({ id: 1 }, 'user');
```

```json
{"type":"debug","file":"app.ts","line":10,"label":"user","value":{"id":1},"valueType":"object","isNew":true}
```

## Guarantees

- Valid JSON per line (JSONL-friendly)
- No ANSI color codes
- Stable field names: `type`, `file`, `line`, `label`, `value`, etc.

Useful for CI logs and log aggregation. Lookman is still a debug toolkit — pair with a real logger for production telemetry.
