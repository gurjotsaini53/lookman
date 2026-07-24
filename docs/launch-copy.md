# Launch copy — Lookman

## One-liners

- I built a smarter `console.log()` that tells you what changed, where it changed, and how long it took.
- Your JavaScript object changed. But who changed it?
- Stop sprinkling `console.log` everywhere. Let Lookman show the change, the call site, and the timing.

## Taglines

- A smarter `console.log()` for JavaScript.
- Debug JavaScript like you can see inside it.

## npm description

A smarter console.log() for JavaScript. Debug values, detect changes, trace async operations, track mutations, and measure performance.

## X / Twitter

```text
Your JS object changed. But who changed it?

const state = dbg.track({ user: { name: "Gurjot" } }, "state")
state.user.name = "John"

⚡ TRACK
state.user.name
"Gurjot" → "John"
app.ts:12

Lookman — a smarter console.log()
npm i lookman
```

## LinkedIn

```text
I open-sourced Lookman — a debugging toolkit that sits between console.log and full observability.

It adds source location, change detection, Promise timing, Proxy-based watchers, and structured JSON output — without trying to replace Pino or Sentry.

npm install lookman
```

## Reddit / Hacker News

```text
Title: Lookman – a smarter console.log() for JavaScript (change detection, Promise tracing, mutation watch)

Body: I got tired of guessing which write mutated shared state. Lookman is a zero-dependency debug helper: dbg(value), dbg.watch / dbg.track, Promise timing, diffs, and a cheap disabled mode for production. Feedback welcome.
```

## Dev.to / blog outline

1. Hook: mutation mystery
2. Why console.log is not enough
3. Demo: track + promises
4. Architecture: disabled fast-path
5. What Lookman is not (not Pino/Sentry)
6. Install + links

## Product Hunt

**Tagline:** A smarter console.log() for JavaScript

**Description:** Debug values, detect changes, trace async work, and see who mutated your objects — with almost zero cost when disabled.
