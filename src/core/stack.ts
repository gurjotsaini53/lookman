export interface CallSite {
  fn: string;
  file: string;
  line: string;
  column: string;
}

const INTERNAL_PATTERNS: RegExp[] = [
  new RegExp(String.raw`[/\\]lookman[/\\]`),
  new RegExp(String.raw`[/\\]dist[/\\]`),
  new RegExp(String.raw`[/\\]src[/\\](core|features|formatters)[/\\]`),
  new RegExp(String.raw`node_modules[/\\]lookman`),
  new RegExp(String.raw`lookman\.(js|cjs|mjs|ts)`),
];

function isInternalFrame(line: string): boolean {
  return INTERNAL_PATTERNS.some((re) => re.test(line));
}

/**
 * Parse the call site of the user who invoked a Lookman API.
 * Skips Lookman internal frames (not the legacy dbg.js heuristic).
 */
export function parseCallSite(skipExtra = 0): CallSite {
  const err = new Error();
  const lines = (err.stack ?? '').split('\n');

  let skipped = 0;
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]!;
    if (isInternalFrame(line)) continue;
    if (!line.includes('at ')) continue;
    if (skipped < skipExtra) {
      skipped++;
      continue;
    }

    const match = line.match(/at (?:(.+?) \()?(.+?):(\d+):(\d+)\)?/);
    if (!match) continue;

    const fn = match[1] || '<anonymous>';
    const fullPath = match[2]!;
    const file = fullPath.split(/[/\\]/).slice(-2).join('/');
    const lineNum = match[3]!;
    const column = match[4]!;

    return { fn, file, line: lineNum, column };
  }

  return { fn: '?', file: '?', line: '?', column: '?' };
}
