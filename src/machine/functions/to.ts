import type { ChildConfig } from '../../actor.types';
import type { PrimitiveObject } from '#bemedev/globals/types';
import type {
  ActorsConfigMap,
  EventsMap,
  ToEventObject,
  ToEvents,
} from '#events';
import { toTransition } from '#transitions';
import _any from '#bemedev/features/common/castings/any';
import type { SimpleMachineOptions } from '#machines';
import type { Child } from '../types';
import { toChildSrc } from './src';
import { identify } from '#bemedev/features/functions/functions/identify';

export type ToChild_F = <
  E extends EventsMap = EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
  R extends { eventsMap: any } = { eventsMap: any },
  Eo extends ToEventObject<ToEvents<E, A>> = ToEventObject<ToEvents<E, A>>,
>(
  events: E,
  actorsMap: A,
  child: ChildConfig & { __id: string },
  options?: SimpleMachineOptions<E, A, Pc, Tc, T, Eo>,
) => Child<Eo, Pc, Tc, T, R>;

/**
 * Converts an emitter config to an emitter object with a source and transitions.
 * @param events of type {@linkcode EventsMap}, the events map.
 * @param actorsMap of type {@linkcode ActorsConfigMap}, the actors map.
 * @param src of type {@linkcode EmitterSrcConfig}, the emitter configuration to convert.
 * @param emitters of type {@linkcode SimpleMachineOptions}, the machine options.
 * @returns an emitter object with a source and transitions.
 *
 * @see {@linkcode toChildSrc} for converting the source.
 * @see {@linkcode toTransition} for converting transitions.
 * @see {@linkcode toArray} for the type of the context.
 * @see {@linkcode ToChild_F} for more details
 */
export const toChild: ToChild_F = (events, actorsMap, child, options) => {
  const tMapper = (config: any) => {
    return toTransition(events, actorsMap, config, options);
  };

  const src = toChildSrc(
    events,
    actorsMap,
    child.__id,
    options?.actors?.children,
  );

  const on = identify(child.on).map(tMapper);
  const contexts = Object.keys(child.contexts || {});
  const out = _any({ src, on, contexts }) as any;

  const { description } = child;
  if (description) out.description = description;

  return out;
};
