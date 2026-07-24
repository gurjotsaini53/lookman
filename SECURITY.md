# Security Policy

## Supported versions

| Version | Supported |
| ------- | --------- |
| 2.x     | Yes       |
| 1.x     | No        |

## Reporting a vulnerability

Lookman is a debugging toolkit. If you discover a security issue (for example,
unexpected code execution via Proxies, prototype pollution through tracking, or
sensitive data exposure in default logging), please:

1. Open a [GitHub security advisory](https://github.com/gurjotsaini53/lookman/security/advisories/new) if available, or
2. Email the maintainer via the GitHub profile linked on the repository.

Please do not open a public issue for sensitive reports until a fix is available.

## Notes for users

- Do not log secrets, tokens, or PII in production.
- Set `dbg.enabled = false` or `LOOKMAN_ENABLED=false` in production.
- Mutation tracking (`watch` / `track`) wraps objects — understand the semantics before using on shared state.
