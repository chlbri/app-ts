import type { Mode } from '#interpreters';
import type { AppConfig, Plugin } from './types';

/**
 * Internal registry that stores all registered plugins
 * and the resolved global configuration.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _plugins: Plugin<string, any>[] = [];
let _mode: Mode = 'strict';

/**
 * Register a plugin globally.
 *
 * @param plugin - The plugin to register.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const registerPlugin = (plugin: Plugin<string, any>): void => {
  const exists = _plugins.some(p => p.name === plugin.name);
  if (exists) return;
  _plugins.push(plugin);
  plugin.setup?.(plugin.options);
};

/**
 * Retrieve all currently registered plugins.
 *
 * @returns A readonly copy of the registered plugins array.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getPlugins = (): readonly Plugin<string, any>[] => {
  return [..._plugins];
};

/**
 * Check whether a plugin with the given name is registered.
 *
 * @param name - The name of the plugin to look for.
 */
export const hasPlugin = (name: string): boolean => {
  return _plugins.some(p => p.name === name);
};

/**
 * Get a registered plugin by name.
 *
 * @param name - The name of the plugin to retrieve.
 * @returns The plugin, or undefined if not found.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getPlugin = (
  name: string,
): Plugin<string, any> | undefined => {
  return _plugins.find(p => p.name === name);
};

/**
 * Set the global default mode.
 *
 * @param mode - The mode to set.
 */
export const setDefaultMode = (mode: Mode): void => {
  _mode = mode;
};

/**
 * Get the global default mode.
 *
 * @returns The current default mode.
 */
export const getDefaultMode = (): Mode => {
  return _mode;
};

/**
 * Apply a full {@linkcode AppConfig} to the global registry.
 * Registers all plugins and sets the default mode.
 *
 * @param config - The application configuration to apply.
 */
export const applyConfig = (config: AppConfig): void => {
  if (config.mode) {
    setDefaultMode(config.mode);
  }
  if (config.plugins) {
    for (const plugin of config.plugins) {
      registerPlugin(plugin);
    }
  }
};

/**
 * Reset the global registry to its initial state.
 * Useful for testing.
 */
export const resetRegistry = (): void => {
  _plugins.length = 0;
  _mode = 'strict';
};
