import type { PrimitiveObject } from '#bemedev/globals/types';
import type {
  ActorsConfigMap,
  EventsMap,
  ToEventObject,
  ToEvents2,
} from '#events';
import { reduceFnMap } from '#utils';
import type { DelayFunction3, DelayMap } from '../types';

export type ToDelay_F = <
  E extends EventsMap = EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
  Eo extends ToEventObject<ToEvents2<E, A>> = ToEventObject<
    ToEvents2<E, A>
  >,
>(
  events: E,
  actorsMap: A,
  delay: string,
  delays?: DelayMap<Eo, Pc, Tc, T>,
) => DelayFunction3<Eo, Pc, Tc, T> | undefined;

/**
 * Converts a delay configuration to a function that returns the delay in milliseconds.
 * If the delay is a number, it returns a function that returns that number.
 * If the delay is a function, it reduces the function map with the provided events and actors.
 *
 * @param events of type {@linkcode EventsMap} [E], the events map to use for resolving the delay.
 * @param actorsMap of type {@linkcode ActorsConfigMap} [A], the actors map to use for resolving the delay.
 * @param delay of type string,  The delay configuration.
 * @param delays of type {@linkcode DelayMap}, the map of delays containing functions to execute.
 * @returns a function that returns the delay in milliseconds or undefined if not found.
 *
 * @see {@linkcode PrimitiveObject}
 * @see {@linkcode reduceFnMap}
 */
export const toDelay: ToDelay_F = (events, actorsMap, delay, delays) => {
  const fn = delays?.[delay];
  const check = typeof fn === 'number';
  if (check) return () => fn;

  const func = fn ? reduceFnMap(events, actorsMap, fn) : undefined;
  return func;
};
