import type { AppConfig, DefineConfig_F } from '../types';
import { applyConfig } from '../registry';

/**
 * Helper function to define the global app-ts configuration
 * with full type inference.
 *
 * When called, it applies the configuration to the global
 * plugin registry immediately.
 *
 * @param config - The application configuration.
 * @returns The same configuration object, typed.
 *
 * @example
 * ```ts
 * export default defineConfig({
 *   mode: 'strict',
 *   plugins: [emittersPlugin],
 * });
 * ```
 */
export const defineConfig: DefineConfig_F = <const C extends AppConfig>(
  config: C,
): C => {
  applyConfig(config);
  return config;
};
