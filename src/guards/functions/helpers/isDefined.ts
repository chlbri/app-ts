import type { PrimitiveObject } from '#bemedev/globals/types';
import type { EventsMap } from '#events';
import type { DefinedValue } from 'src/guards/types';
import type { FnR } from 'src/types/primitives';
import { isNotValue, isValue } from './value';
import type { ActorsConfigMap } from '#events';
import type { Config } from 'src/machine/types';

export type IsDefinedS_F = <
  C extends Config,
  E extends EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
>(
  path: DefinedValue<Pc, Tc>,
) => FnR<C, E, A, Pc, Tc, boolean>;

/**
 * Checks if the given path is defined (not undefined or null).
 * @param path : A {@linkcode DefinedValue}, the path to retrieve.
 * @returns A {@linkcode FnR} function that returns true if the path is defined, false otherwise.
 *
 * @see {@linkcode isNotValue} for more details.
 * @see {@linkcode EventsMap}
 * @see {@linkcode PromiseeMap}
 * @see {@linkcode PrimitiveObject}
 *
 */
export const isDefinedS: IsDefinedS_F = path => {
  return isNotValue(path, undefined, null);
};

/**
 * Checks if the given path is undefined or null.
 * @param path : A {@linkcode DefinedValue} , the path to retrieve.
 * @returns A {@linkcode FnR} function that returns true if the path is undefined or null, false otherwise.
 *
 * @see {@linkcode isValue} for more details.
 * @see {@linkcode EventsMap}
 * @see {@linkcode PromiseeMap}
 * @see {@linkcode PrimitiveObject}
 */
export const isNotDefinedS: IsDefinedS_F = path => {
  return isValue(path, undefined, null);
};
