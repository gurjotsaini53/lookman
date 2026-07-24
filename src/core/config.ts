export type OutputFormat = 'pretty' | 'json';

export interface LookmanConfig {
  enabled: boolean;
  colors: boolean;
  timestamps: boolean;
  location: boolean;
  format: OutputFormat;
}

const defaults: LookmanConfig = {
  enabled: true,
  colors: true,
  timestamps: false,
  location: true,
  format: 'pretty',
};

function readEnv(): Partial<LookmanConfig> {
  const env =
    typeof globalThis !== 'undefined' &&
    (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
  if (!env) return {};

  const partial: Partial<LookmanConfig> = {};

  if (env.LOOKMAN_ENABLED !== undefined) {
    partial.enabled = !['0', 'false', 'no', 'off'].includes(env.LOOKMAN_ENABLED.toLowerCase());
  }
  if (env.LOOKMAN_FORMAT === 'json' || env.LOOKMAN_FORMAT === 'pretty') {
    partial.format = env.LOOKMAN_FORMAT;
  }
  if (env.LOOKMAN_COLORS !== undefined) {
    partial.colors = !['0', 'false', 'no', 'off'].includes(env.LOOKMAN_COLORS.toLowerCase());
  }
  if (env.LOOKMAN_TIMESTAMPS !== undefined) {
    partial.timestamps = ['1', 'true', 'yes', 'on'].includes(env.LOOKMAN_TIMESTAMPS.toLowerCase());
  }
  if (env.LOOKMAN_LOCATION !== undefined) {
    partial.location = !['0', 'false', 'no', 'off'].includes(env.LOOKMAN_LOCATION.toLowerCase());
  }

  return partial;
}

const state: LookmanConfig = { ...defaults, ...readEnv() };

export function getConfig(): Readonly<LookmanConfig> {
  return state;
}

export function configure(options: Partial<LookmanConfig>): Readonly<LookmanConfig> {
  if (options.enabled !== undefined) state.enabled = options.enabled;
  if (options.colors !== undefined) state.colors = options.colors;
  if (options.timestamps !== undefined) state.timestamps = options.timestamps;
  if (options.location !== undefined) state.location = options.location;
  if (options.format !== undefined) state.format = options.format;
  return state;
}

export function isEnabled(): boolean {
  return state.enabled;
}

export function setEnabled(value: boolean): void {
  state.enabled = value;
}
