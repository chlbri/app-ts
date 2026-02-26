import type { PrimitiveObject } from '#bemedev/globals/types';
import type { ActorsConfigMap, EventsMap } from '#events';
import type { SimpleMachineOptions } from 'src/machine/types2';
import type { Emitter } from '../types2';
import { toEmitterSrc } from './src';
import { toArray } from '@bemedev/basifun';
import type { EmitterConfig } from '#actor';
import { toTransition } from '#transitions';

export type ToEmitter_F = <
  E extends EventsMap = EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  TC extends PrimitiveObject = PrimitiveObject,
>(
  events: E,
  actorsMap: A,
  emitter: EmitterConfig,
  options?: SimpleMachineOptions<E, A, Pc, TC>,
) => Emitter<E, A, Pc, TC>;

/**
 * Converts an emitter config to an emitter object with a source and transitions.
 * @param events of type {@linkcode EventsMap}, the events map.
 * @param actorsMap of type {@linkcode ActorsConfigMap}, the actors map.
 * @param src of type {@linkcode EmitterSrcConfig}, the emitter configuration to convert.
 * @param emitters of type {@linkcode SimpleMachineOptions}, the machine options.
 * @returns an emitter object with a source and transitions.
 *
 * @see {@linkcode toEmitterSrc} for converting the source.
 * @see {@linkcode toTransition} for converting transitions.
 * @see {@linkcode toArray.typed} for the type of the context.
 * @see {@linkcode ToEmitter_F} for more details
 */
export const toEmitter: ToEmitter_F = (
  events,
  actorsMap,
  emitter,
  options,
) => {
  const src = toEmitterSrc(emitter.src, options?.actors?.emitters);

  const next = toArray
    .typed(emitter.next)
    .map(config =>
      toTransition(events, actorsMap, config as any, options),
    );

  const error = toArray
    .typed(emitter.error)
    .map(config =>
      toTransition(events, actorsMap, config as any, options),
    );

  const complete = toArray.typed(emitter.complete).map(config => {
    const check1 = typeof config === 'object' && 'actions' in config;
    if (check1) return toTransition(events, actorsMap, config, options);

    return toTransition(events, actorsMap, { actions: config }, options);
  });

  const out = { src, then: next, catch: error, finally: complete } as any;

  const { description } = emitter;
  if (description) out.description = description;

  return out;
};
