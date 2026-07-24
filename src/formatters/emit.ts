import { getConfig } from '../core/config.js';
import { getIndentLevel } from '../core/state.js';
import { colorize, formatValue, toJsonValue } from './values.js';

export type EventType =
  | 'debug'
  | 'count'
  | 'time'
  | 'timeEnd'
  | 'group'
  | 'table'
  | 'watch'
  | 'track'
  | 'log'
  | 'diff'
  | 'assert'
  | 'once'
  | 'fn'
  | 'promise';

export interface DebugEvent {
  type: EventType;
  file?: string;
  line?: string;
  fn?: string;
  label?: string;
  value?: unknown;
  prev?: unknown;
  message?: string;
  badge?: string;
  durationMs?: number;
  count?: number;
  path?: string;
  from?: unknown;
  to?: unknown;
  args?: unknown[];
  status?: string;
  diffLines?: string[];
  icon?: string;
  valueType?: string;
  changed?: boolean;
  isNew?: boolean;
}

function timestamp(): string {
  return new Date().toISOString();
}

export function emit(event: DebugEvent): void {
  const config = getConfig();
  if (!config.enabled) return;

  if (config.format === 'json') {
    emitJson(event);
    return;
  }
  emitPretty(event);
}

function emitJson(event: DebugEvent): void {
  const config = getConfig();
  const payload: Record<string, unknown> = {
    type: event.type,
  };
  if (config.timestamps) payload.timestamp = timestamp();
  if (config.location && event.file) {
    payload.file = event.file;
    payload.line = event.line ? Number(event.line) || event.line : event.line;
  }
  if (event.fn) payload.fn = event.fn;
  if (event.label) payload.label = event.label;
  if (event.value !== undefined) payload.value = toJsonValue(event.value);
  if (event.prev !== undefined) payload.prev = toJsonValue(event.prev);
  if (event.message) payload.message = event.message;
  if (event.durationMs !== undefined) payload.durationMs = event.durationMs;
  if (event.count !== undefined) payload.count = event.count;
  if (event.path) payload.path = event.path;
  if (event.from !== undefined) payload.from = toJsonValue(event.from);
  if (event.to !== undefined) payload.to = toJsonValue(event.to);
  if (event.args) payload.args = toJsonValue(event.args);
  if (event.status) payload.status = event.status;
  if (event.diffLines) payload.diff = event.diffLines;
  if (event.valueType) payload.valueType = event.valueType;
  if (event.changed !== undefined) payload.changed = event.changed;
  if (event.isNew !== undefined) payload.isNew = event.isNew;

  console.log(JSON.stringify(payload));
}

function emitPretty(event: DebugEvent): void {
  const config = getConfig();
  const colors = config.colors;
  const indent = '  '.repeat(getIndentLevel());
  const ts = config.timestamps ? colorize('dim', `${timestamp()} `, colors) : '';

  switch (event.type) {
    case 'debug':
    case 'once':
    case 'promise': {
      const icon = event.icon ?? ' DBG ';
      const tag = colorize('bold', colorize('cyan', icon, colors), colors);
      const loc =
        config.location && event.file
          ? colorize('dim', `${event.file}:${event.line}`, colors)
          : '';
      const fnLabel =
        event.fn && event.fn !== '<anonymous>' && event.fn !== '?'
          ? colorize('dim', ` in ${event.fn}()`, colors)
          : '';
      const badge = event.badge ?? '';
      console.log(`${indent}${ts}${tag} ${loc}${fnLabel}${badge}`);
      const nameLabel = event.label ? colorize('bold', `${event.label} `, colors) : '';
      const typeBadge = event.valueType
        ? colorize('dim', `[${event.valueType}] `, colors)
        : '';
      console.log(
        `${indent}  ${nameLabel}${typeBadge}${
          event.status === 'pending' || typeof event.value === 'string' && String(event.value).includes('pending')
            ? String(event.value)
            : formatValue(event.value, colors)
        }`,
      );
      if (event.changed && event.prev !== undefined) {
        if (event.diffLines && event.diffLines.length > 0) {
          console.log(`${indent}  ${colorize('dim', 'diff:', colors)}`);
          for (const line of event.diffLines) {
            console.log(`${indent}    ${line}`);
          }
        } else {
          console.log(
            `${indent}  ${colorize('dim', 'was:', colors)} ${formatValue(event.prev, colors)}`,
          );
        }
      }
      console.log('');
      break;
    }
    case 'count': {
      const tag = colorize('bold', colorize('green', ' COUNT ', colors), colors);
      const loc =
        config.location && event.file
          ? colorize('dim', `${event.file}:${event.line} `, colors)
          : '';
      console.log(
        `${indent}${ts}${tag} ${loc}${colorize('bold', event.label ?? 'default', colors)}: ${colorize('yellow', String(event.count), colors)}`,
      );
      break;
    }
    case 'time': {
      const tag = colorize('bold', colorize('magenta', ' TIME ', colors), colors);
      console.log(
        `${indent}${ts}${tag} ${colorize('bold', event.label ?? 'default', colors)} started...`,
      );
      break;
    }
    case 'timeEnd': {
      const tag = colorize('bold', colorize('magenta', ' TIME ', colors), colors);
      if (event.message) {
        console.log(`${indent}${ts}${tag} ${colorize('red', 'Error:', colors)} ${event.message}`);
      } else {
        console.log(
          `${indent}${ts}${tag} ${colorize('bold', event.label ?? 'default', colors)}: ${colorize('yellow', `${event.durationMs}ms`, colors)}`,
        );
      }
      break;
    }
    case 'group': {
      if (event.label) console.log(colorize('bold', `\n🔽 ${event.label}`, colors));
      break;
    }
    case 'table': {
      if (event.label) {
        const loc =
          config.location && event.file ? ` (${event.file}:${event.line})` : '';
        console.log(colorize('bold', `\n TABLE: ${event.label}${loc}`, colors));
      }
      console.table(event.value);
      console.log('');
      break;
    }
    case 'watch':
    case 'track': {
      const tag = colorize(
        'bold',
        colorize('yellow', event.type === 'watch' ? ' ⚡ WATCH ' : ' ⚡ TRACK ', colors),
        colors,
      );
      const loc =
        config.location && event.file
          ? colorize('dim', `${event.file}:${event.line}`, colors)
          : '';
      console.log(`${indent}${ts}${tag}`);
      console.log('');
      console.log(`${indent}${colorize('cyan', event.path ?? '', colors)}`);
      console.log(
        `${indent}${formatValue(event.from, colors)} → ${formatValue(event.to, colors)}`,
      );
      if (config.location && event.file) {
        console.log('');
        console.log(`${indent}${colorize('dim', 'Location:', colors)}`);
        console.log(`${indent}${loc}`);
      }
      console.log('');
      break;
    }
    case 'log': {
      const loc =
        config.location && event.file
          ? colorize('dim', `[${event.file}:${event.line}]`, colors)
          : '';
      const args = Array.isArray(event.args) ? event.args : [];
      console.log(`${indent}${ts}${loc}`, ...args);
      break;
    }
    case 'diff': {
      const tag = colorize('bold', colorize('yellow', ' ⚡ DIFF ', colors), colors);
      console.log(`${indent}${ts}${tag}`);
      console.log('');
      for (const line of event.diffLines ?? []) {
        console.log(`${indent}${line}`);
      }
      console.log('');
      break;
    }
    case 'assert': {
      const tag = colorize('bold', colorize('red', ' ❌ ASSERT FAILED ', colors), colors);
      console.log(`${indent}${ts}${tag}`);
      console.log('');
      console.log(`${indent}${event.message ?? 'Assertion failed'}`);
      if (config.location && event.file) {
        console.log('');
        console.log(`${indent}${colorize('dim', 'Location:', colors)}`);
        console.log(`${indent}${event.file}:${event.line}`);
      }
      console.log('');
      break;
    }
    case 'fn': {
      const tag = colorize('bold', colorize('cyan', ' ▶ ', colors), colors);
      console.log(
        `${indent}${ts}${tag}${colorize('bold', `${event.label ?? 'fn'}()`, colors)}`,
      );
      if (event.args) {
        console.log(`${indent}${colorize('dim', 'args:', colors)}`);
        console.log(`${indent}${formatValue(event.args, colors)}`);
      }
      if (event.status === 'running') {
        console.log(`${indent}${colorize('dim', '⏳ running...', colors)}`);
      }
      if (event.status === 'completed') {
        console.log(`${indent}${colorize('green', '✅ completed', colors)}`);
        if (event.durationMs !== undefined) {
          console.log(`${indent}${colorize('dim', 'duration:', colors)} ${event.durationMs}ms`);
        }
        console.log(`${indent}${colorize('dim', 'result:', colors)}`);
        console.log(`${indent}${formatValue(event.value, colors)}`);
      }
      if (event.status === 'error') {
        console.log(`${indent}${colorize('red', '❌ error', colors)}`);
        if (event.durationMs !== undefined) {
          console.log(`${indent}${colorize('dim', 'duration:', colors)} ${event.durationMs}ms`);
        }
        console.log(`${indent}${formatValue(event.value, colors)}`);
      }
      console.log('');
      break;
    }
    default:
      break;
  }
}
