import type { PromiseeConfig } from '#actor';
import type { PrimitiveObject } from '#bemedev/globals/types';
import type {
  ActorsConfigMap,
  EventsMap,
  ToEventObject,
  ToEvents2,
} from '#events';
import { toTransition } from '#transitions';
import { toArray } from '@bemedev/basifun';
import type { SimpleMachineOptions } from 'src/machine/types';
import type { Promisee } from '../types';
import { toPromiseSrc } from './src';

export type ToPromise_F = <
  E extends EventsMap = EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
  R = any,
  Eo extends ToEventObject<ToEvents2<E, A>> = ToEventObject<
    ToEvents2<E, A>
  >,
>(
  events: E,
  actorsMap: A,
  src: PromiseeConfig,
  promises?: SimpleMachineOptions<E, A, Pc, Tc, T, Eo>,
) => Promisee<Eo, Pc, Tc, T, R>;

/**
 * Converts a promise config to a promisee object with a source and transitions.
 * @param events of type {@linkcode EventsMap}, the events map.
 * @param actorsMap of type {@linkcode PromiseeMap}, the promisees map.
 * @param promise of type {@linkcode PromiseeConfig}, the promise configuration to convert.
 * @param options of type {@linkcode SimpleMachineOptions}, the machine options.
 * @returns a promisee object with a source and transitions.
 *
 * @see {@linkcode toPromiseSrc} for converting the source.
 * @see {@linkcode toTransition} for converting transitions.
 * @see {@linkcode toArray.typed} for the type of the context.
 * @see {@linkcode ToPromise_F} formore details
 */
export const toPromise: ToPromise_F = (
  events,
  actorsMap,
  promise,
  options,
) => {
  const src = toPromiseSrc(
    events,
    actorsMap,
    promise.src,
    options?.actors?.promises,
  );

  const then = toArray
    .typed(promise.then)
    .map(config =>
      toTransition(events, actorsMap, config as any, options),
    );

  const _catch = toArray
    .typed(promise.catch)
    .map(config =>
      toTransition(events, actorsMap, config as any, options),
    );

  const _finally = toArray.typed(promise.finally).map(config => {
    const check1 = typeof config === 'object' && 'actions' in config;
    if (check1) return toTransition(events, actorsMap, config, options);

    return toTransition(events, actorsMap, { actions: config }, options);
  });

  const out = { src, then, catch: _catch, finally: _finally } as any;

  const { description } = promise;
  if (description) out.description = description;

  return out;
};
