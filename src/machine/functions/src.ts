import { PrimitiveObject } from '#bemedev/globals/types';
import {
  ActorsConfigMap,
  EventsMap,
  ToEventObject,
  ToEvents2,
} from '#events';
import { reduceFnMap } from '#utils';
import type { ChildFunction2, ChildrenMap } from '../types';

export type ToChildSrc_F<
  E extends EventsMap = EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
  Eo extends ToEventObject<ToEvents2<E, A>> = ToEventObject<
    ToEvents2<E, A>
  >,
  R extends { eventsMap: any } = { eventsMap: any },
> = (
  events: E,
  actorsMap: A,
  emitter: string,
  emitters?: ChildrenMap<Eo, Pc, Tc, T>,
) => ChildFunction2<Eo, Pc, Tc, T, R> | undefined;

/**
 * Converts a child configuration to a child machine object.
 * @param _child of type {@linkcode EmitterSrcConfig}, the machine configuration to convert.
 * @param children of type {@linkcode EmitterMap}, the map of emitters to look up the emitter configuration.
 * @returns an emitter object with an id, or undefined if the emitter is not found.
 *
 * @see {@linkcode EventsMap} for the events map
 * @see {@linkcode ActorsConfigMap} for the actors map
 */
export const toChildSrc: ToChildSrc_F = (
  events,
  actorsMap,
  child,
  children,
) => {
  const fn = children?.[child];
  const func = fn ? reduceFnMap(events, actorsMap, fn) : undefined;
  return func;
};
