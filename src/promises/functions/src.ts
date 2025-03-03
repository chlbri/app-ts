import type { EventsMap, PromiseeMap } from '~events';
import type { SimpleMachineOptions } from '~machines';
import { type PrimitiveObject } from '~types';
import { reduceFnMap } from '~utils';
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
