import type { Fn } from '@bemedev/types';
import type { EventsMap, PromiseeMap, ToEvents } from '~events';
import type { PrimitiveObject } from '~types';
import { reduceFnMap } from '~utils';
import type { DelayMap } from '../types';

export type ToDelay_F = <
  E extends EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
>(
  events: E,
  promisees: P,
  delay: string,
  delays?: DelayMap<E, P, Pc, Tc>,
) => Fn<[Pc, Tc, ToEvents<E, P>], number> | undefined;

/**
 * Converts a delay configuration to a function that returns the delay in milliseconds.
 * If the delay is a number, it returns a function that returns that number.
 * If the delay is a function, it reduces the function map with the provided events and promisees.
 *
 * @param events - {@linkcode EventsMap} [E] - The events map to use for resolving the delay.
 * @param promisees - {@linkcode PromiseeMap} [P] - The promisees map to use for resolving the delay.
 * @param delay - The delay configuration.
 * @param delays - {@linkcode DelayMap}<[E], [P], [Pc], [Tc]> - The map of delays containing functions to execute.
 * @returns A function that returns the delay in milliseconds or undefined if not found.
 *
 * @see {@linkcode Fn}
 * @see {@linkcode ToEvents}
 * @see {@linkcode PrimitiveObject}
 */
export const toDelay: ToDelay_F = (events, promisees, delay, delays) => {
  const fn = delays?.[delay];
  const check = typeof fn === 'number';
  if (check) return () => fn;

  const func = fn ? reduceFnMap(events, promisees, fn) : undefined;
  return func;
};
