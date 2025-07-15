import type { types } from '@bemedev/types';
import type { EventsMap, PromiseeMap } from '~events';
import type { DefinedValue } from '~guards';
import type { FnR } from '~types';
import { isNotValue, isValue } from './value';

export type IsDefinedS_F = <
  E extends EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc extends types.PrimitiveObject = types.PrimitiveObject,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
>(
  path: DefinedValue<Pc, Tc>,
) => FnR<E, P, Pc, Tc, boolean>;

/**
 * Checks if the given path is defined (not undefined or null).
 * @param path : A {@linkcode DefinedValue}, the path to retrieve.
 * @returns A {@linkcode FnR} function that returns true if the path is defined, false otherwise.
 *
 * @see {@linkcode isNotValue} for more details.
 * @see {@linkcode EventsMap}
 * @see {@linkcode PromiseeMap}
 * @see {@linkcode types.PrimitiveObject}
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
 * @see {@linkcode types.PrimitiveObject}
 */
export const isNotDefinedS: IsDefinedS_F = path => {
  return isValue(path, undefined, null);
};
