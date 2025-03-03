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

export const toDelay: ToDelay_F = (events, promisees, delay, delays) => {
  const fn = delays?.[delay];
  const check = typeof fn === 'number';
  if (check) return () => fn;

  const func = fn ? reduceFnMap(events, promisees, fn) : undefined;
  return func;
};
