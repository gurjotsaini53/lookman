# Changelog

All notable changes to this project will be documented in this file.

## [2.0.0] - 2026-07-24

### Added

- TypeScript rewrite with full declaration files
- Dual ESM + CommonJS package exports
- `dbg.diff()` structured value diffing
- `dbg.assert()` debug assertions with source location
- `dbg.once()` one-time keyed logging
- `dbg.fn()` sync/async function tracing
- `dbg.configure()` configuration API
- JSON output format (`format: 'json'`)
- Environment variables: `LOOKMAN_ENABLED`, `LOOKMAN_FORMAT`, `LOOKMAN_COLORS`, `LOOKMAN_TIMESTAMPS`, `LOOKMAN_LOCATION`
- Robust fingerprint serialization (NaN, BigInt, Date, Map, Set, circular)
- WeakMap-cached deep `watch` proxies with nested paths
- Comprehensive Vitest suite and micro-benchmarks
- Documentation, examples, GitHub Actions CI, and static website

### Fixed

- Package was unloadable (`"type": "commonjs"` with ESM `export`)
- Call-site detection incorrectly filtered on `dbg.js`
- Promise rejection timer leak / missing duration
- Timer map collisions between promises and `time()`
- `watch` created a new Proxy on every property access
- `silent` recursively re-entered `dbg()`
- `reset()` skipped work when disabled

### Changed

- License aligned to MIT
- Minimum Node.js version: 18
- Change detection now shows structured diffs when possible
- `reset()` clears history, counters, timers, and once-keys

## [1.0.4] - 2026-05-02

- Enable/disable setting and README updates (legacy single-file release)
