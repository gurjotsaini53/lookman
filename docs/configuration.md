# Configuration

```ts
dbg.configure({
  enabled: true,
  colors: true,
  timestamps: false,
  location: true,
  format: 'pretty', // 'pretty' | 'json'
});
```

| Option | Default | Meaning |
| --- | --- | --- |
| `enabled` | `true` | Master switch |
| `colors` | `true` | ANSI colors in pretty mode |
| `timestamps` | `false` | ISO timestamps |
| `location` | `true` | file:line in output |
| `format` | `'pretty'` | pretty terminal or JSON lines |

## Environment variables

| Variable | Values |
| --- | --- |
| `LOOKMAN_ENABLED` | `true`/`false` (also `0`, `off`, `no`) |
| `LOOKMAN_FORMAT` | `pretty` / `json` |
| `LOOKMAN_COLORS` | `true`/`false` |
| `LOOKMAN_TIMESTAMPS` | `true`/`false` |
| `LOOKMAN_LOCATION` | `true`/`false` |

`dbg.enabled` remains a live getter/setter for compatibility.
