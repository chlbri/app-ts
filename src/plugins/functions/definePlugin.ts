import type { Plugin, DefinePlugin_F } from '../types';

/**
 * Helper function to define a plugin with full type inference.
 *
 * @param plugin - The plugin definition.
 * @returns The same plugin object, typed.
 *
 * @example
 * ```ts
 * const myPlugin = definePlugin({
 *   name: 'my-plugin',
 *   description: 'A custom plugin',
 *   options: { key: 'value' },
 *   setup(options) {
 *     console.log('Plugin setup with', options);
 *   },
 * });
 * ```
 */
export const definePlugin: DefinePlugin_F = <
  const N extends string,
  const O extends Record<string, unknown> = Record<string, unknown>,
>(
  plugin: Plugin<N, O>,
): Plugin<N, O> => {
  return plugin;
};
