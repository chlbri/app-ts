import type { EventsMap } from '~events';
import type { SimpleMachineOptions } from '~machines';
import { isDescriber, type PrimitiveObject } from '~types';
import { reduceFnMap } from '~utils';
import type { PromiseFunction2 } from '../types';

export type ToPromiseSrc_F = <
  E extends EventsMap = EventsMap,
  Pc = any,
  TC extends PrimitiveObject = PrimitiveObject,
>(
  events: E,
  src: string,
  promises?: SimpleMachineOptions<E, Pc, TC>['promises'],
) => PromiseFunction2<E, Pc, TC> | undefined;

export const toPromiseSrc: ToPromiseSrc_F = (events, src, promises) => {
  if (isDescriber(src)) {
    const fn = promises?.[src.name];
    const func = fn ? reduceFnMap(events, fn) : undefined;
    return func;
  }

  const fn = promises?.[src];

  const func = fn ? reduceFnMap(events, fn) : undefined;
  return func;
};
