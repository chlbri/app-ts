import type { Fn } from '@bemedev/types';
import type { EventsMap, ToEvents } from '~events';
import type { PrimitiveObject } from '~types';
import { reduceFnMap } from '~utils';
import type { DelayMap } from '../types';

export type ToDelay_F = <
  E extends EventsMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
>(
  events: E,
  delay?: string,
  delays?: DelayMap<E, Pc, Tc>,
) => Fn<[Pc, Tc, ToEvents<E>], number> | undefined;

export const toDelay: ToDelay_F = (events, delay, delays) => {
  if (!delay) return undefined;

  const fn = delays?.[delay];
  const check = typeof fn === 'number';
  if (check) return () => fn;

  const func = fn ? reduceFnMap(events, fn) : undefined;
  return func;
};
