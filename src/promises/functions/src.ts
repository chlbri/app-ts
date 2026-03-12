import type { PrimitiveObject } from '#bemedev/globals/types';
import {
  ActorsConfigMap,
  EventsMap,
  ToEventObject,
  ToEvents2,
} from '#events';
import { reduceFnMap } from '#utils';
import type { PromiseFunction2, PromisesMap } from '../types';

export type ToPromiseSrc_F = <
  E extends EventsMap = EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
  R = any,
  Eo extends ToEventObject<ToEvents2<E, A>> = ToEventObject<
    ToEvents2<E, A>
  >,
>(
  events: E,
  promisees: A,
  src: string,
  promises?: PromisesMap<Eo, Pc, Tc, T>,
) => PromiseFunction2<Eo, Pc, Tc, T, R> | undefined;

/**
 * Converts a source string to a function that can be used to retrieve the promise.
 * @param events of type {@linkcode EventsMap}, the events map.
 * @param promisees of type {@linkcode ActorsConfigMap}, the actors config map.
 * @param src of type string, the source string to convert.
 * @returns a function that retrieves the promise or undefined if not found.
 *
 * @see {@linkcode reduceFnMap} for reducing the function map.
 * @see {@linkcode PromiseFunction2} for more details
 */
export const toPromiseSrc: ToPromiseSrc_F = (
  events,
  promisees,
  src,
  promises,
) => {
  const fn = promises?.[src];
  const func = fn ? reduceFnMap(events, promisees, fn) : undefined;
  return func as any;
};
