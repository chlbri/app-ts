import type { Mode } from '#interpreters';
import type { RecordS } from '~types';

/**
 * Configuration for a single plugin.
 *
 * @template N - The name of the plugin.
 * @template O - The options type for the plugin.
 */
export type PluginConfig<
  N extends string = string,
  O extends RecordS = RecordS,
> = {
  readonly name: N;
  readonly description?: string;
  readonly options?: O;
};

/**
 * A plugin that can be registered globally to extend
 * Machine and Interpreter capabilities.
 *
 * @template N - The name of the plugin.
 * @template O - The options type for the plugin.
 */
export type Plugin<
  N extends string = string,
  O extends RecordS = RecordS,
> = PluginConfig<N, O> & {
  readonly setup?: (options?: O) => void;
};

/**
 * Global application configuration for app-ts.
 *
 * @template M - The default mode type.
 */
export type AppConfig<M extends Mode = Mode> = {
  readonly mode?: M;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly plugins?: readonly Plugin<string, any>[];
};

/**
 * Helper type to extract the name of a plugin.
 */
export type PluginName<P extends Plugin> = P['name'];

/**
 * Helper type to extract the options of a plugin.
 */
export type PluginOptions<P extends Plugin> = P['options'];

/**
 * Helper type to extract plugin names from a config.
 */
export type PluginNames<C extends AppConfig> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  C['plugins'] extends readonly Plugin<string, any>[]
    ? PluginName<C['plugins'][number]>
    : never;

/**
 * Type to define a plugin for app-ts.
 */
export type DefinePlugin_F = <
  const N extends string,
  const O extends RecordS = RecordS,
>(
  plugin: Plugin<N, O>,
) => Plugin<N, O>;

/**
 * Type to define the app-ts configuration.
 */
export type DefineConfig_F = <const C extends AppConfig>(config: C) => C;
