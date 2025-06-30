import type { DefinedValue } from 'src/guards/types';
import type { EventsMap, PromiseeMap } from '~events';
import type { FnR, PrimitiveObject } from '~types';
import { isNotValue, isValue } from './value';

export type IsDefinedS_F = <
  E extends EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
>(
  path: DefinedValue<Pc, Tc>,
) => FnR<E, P, Pc, Tc, boolean>;

/**
 * Checks if the given path is defined (not undefined or null).
 * @param path : A {@linkcode DefinedValue} , the path to retrieve.
 * @returns A {@linkcode FnR}<{@linkcode EventsMap}[E], {@linkcode PromiseeMap}[P], [Pc], {@linkcode PrimitiveObject}[Tc]> function that returns true if the path is defined, false otherwise.
 */
export const isDefinedS: IsDefinedS_F = path => {
  return isNotValue(path, undefined, null);
};

/**
 * Checks if the given path is undefined or null.
 * @param path : A {@linkcode DefinedValue} , the path to retrieve.
 * @returns A {@linkcode FnR}<{@linkcode EventsMap}[E], {@linkcode PromiseeMap}[P], [Pc], {@linkcode PrimitiveObject}[Tc]> function that returns true if the path is defined, false otherwise.
 */
export const isNotDefinedS: IsDefinedS_F = path => {
  return isValue(path, undefined, null);
};
