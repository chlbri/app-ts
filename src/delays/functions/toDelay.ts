import type { EventsMap, PromiseeMap } from '#events';
import { reduceFnMap } from '#utils';
import type { types } from '@bemedev/types';
import type { FnR } from '~types';
import type { DelayMap } from '../types';

export type ToDelay_F = <
  E extends EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
>(
  events: E,
  promisees: P,
  delay: string,
  delays?: DelayMap<E, P, Pc, Tc>,
) => FnR<E, P, Pc, Tc, number> | undefined;

/**
 * Converts a delay configuration to a function that returns the delay in milliseconds.
 * If the delay is a number, it returns a function that returns that number.
 * If the delay is a function, it reduces the function map with the provided events and promisees.
 *
 * @param events of type {@linkcode EventsMap} [E], the events map to use for resolving the delay.
 * @param promisees of type {@linkcode PromiseeMap} [P], the promisees map to use for resolving the delay.
 * @param delay of type string,  The delay configuration.
 * @param delays of type {@linkcode DelayMap}, the map of delays containing functions to execute.
 * @returns a function that returns the delay in milliseconds or undefined if not found.
 *
 * @see {@linkcode types.PrimitiveObject}
 * @see {@linkcode reduceFnMap}
 */
export const toDelay: ToDelay_F = (events, promisees, delay, delays) => {
  const fn = delays?.[delay];
  const check = typeof fn === 'number';
  if (check) return () => fn;

  const func = fn ? reduceFnMap(events, promisees, fn) : undefined;
  return func;
};
