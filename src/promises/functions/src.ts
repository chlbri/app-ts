import type {
  NotUndefined,
  PrimitiveObject,
} from '#bemedev/globals/types';
import type { EventsMap } from '#events';
import type { Config, SimpleMachineOptions } from 'src/machine/types2';
import { reduceFnMap } from '#utils';
import type { PromiseFunction2 } from '../types2';
import type { ActorsConfigMap } from '#events';

export type ToPromiseSrc_F = <
  C extends Config = Config,
  E extends EventsMap = EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  TC extends PrimitiveObject = PrimitiveObject,
>(
  events: E,
  promisees: A,
  src: string,
  promises?: NotUndefined<
    SimpleMachineOptions<E, A, Pc, TC>['actors']
  >['promises'],
) => PromiseFunction2<C, E, A, Pc, TC> | undefined;

/**
 * Converts a source string to a function that can be used to retrieve the promise.
 * @param events of type {@linkcode EventsMap}, the events map.
 * @param promisees of type {@linkcode ActorsConfigMap}, the actors config map.
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
  return func as any;
};
