import type { PrimitiveObject } from '#bemedev/globals/types';
import type { ActorsConfigMap, EventObject, EventsMap } from '#events';
import type { EmitterFunction2, EmittersMap } from '../types';

export type ToEmitterSrc_F = <
  E extends EventsMap = EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
  Eo extends EventObject = EventObject,
  R = any,
>(
  events: E,
  actorsMap: A,
  emitter: string,
  emitters?: EmittersMap<Eo, Pc, Tc, T>,
) => EmitterFunction2<Eo, Pc, Tc, T, R> | undefined;

export const toEmitterSrc: ToEmitterSrc_F = (
  _events,
  _actorsMap,
  emitter,
  emitters,
) => {
  return emitters?.[emitter] as any;
};
