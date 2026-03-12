import type { PrimitiveObject } from '#bemedev/globals/types';
import type {
  ActorsConfigMap,
  EventsMap,
  ToEventObject,
  ToEvents2,
} from '#events';
import { reduceFnMap } from '#utils';
import type { EmitterFunction2, EmittersMap } from '../types';

export type ToEmitterSrc_F = <
  E extends EventsMap = EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
  Eo extends ToEventObject<ToEvents2<E, A>> = ToEventObject<
    ToEvents2<E, A>
  >,
  R = any,
>(
  events: E,
  actorsMap: A,
  emitter: string,
  emitters?: EmittersMap<Eo, Pc, Tc, T>,
) => EmitterFunction2<Eo, Pc, Tc, T, R> | undefined;

export const toEmitterSrc: ToEmitterSrc_F = (
  events,
  actorsMap,
  emitter,
  emitters,
) => {
  const fn = emitters?.[emitter];
  const func = fn ? reduceFnMap(events, actorsMap, fn) : undefined;
  return func;
};
