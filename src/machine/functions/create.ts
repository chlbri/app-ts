import _any from '#bemedev/features/common/castings/any';
import type { Config } from '#machines';

export type CreateConfig_F = <const T extends Config>(config: T) => T;

/**
 * Creates a machine configuration.
 * This function takes a configuration object and returns it as is.
 * It is a utility function to ensure that the configuration is of the correct type.
 *
 * @param value - The configuration object of type {@linkcode Config}.
 *
 * @returns The same configuration object of type {@linkcode Config}.
 *
 */
export const createConfig: CreateConfig_F = _any;
