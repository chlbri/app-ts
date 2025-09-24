import type { PrimitiveObject } from '#bemedev/globals/types';
import type { EventsMap, PromiseeMap } from '#events';
import type { SimpleMachineOptions } from '#machines';
import { reduceFnMap } from '#utils';
import type { PromiseFunction2 } from '../types';

export type ToPromiseSrc_F = <
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  TC extends PrimitiveObject = PrimitiveObject,
>(
  events: E,
  promisees: P,
  src: string,
  promises?: SimpleMachineOptions<E, P, Pc, TC>['promises'],
) => PromiseFunction2<E, P, Pc, TC> | undefined;

/**
 * Converts a source string to a function that can be used to retrieve the promise.
 * @param events of type {@linkcode EventsMap}, the events map.
 * @param promisees of type {@linkcode PromiseeMap}, the promisees map.
 * @param src of type string, the source string to convert.
 * @param promises of type {@linkcode SimpleMachineOptions}, the machine options containing promises.
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
  return func;
};
