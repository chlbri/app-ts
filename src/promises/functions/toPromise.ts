import type { EventsMap, PromiseeMap } from '#events';
import type { SimpleMachineOptions } from '#machines';
import type { PromiseeConfig } from '#promises';
import { toTransition } from '#transitions';
import { toArray } from '@bemedev/basifun';
import type { types } from '@bemedev/types';
import type { Promisee } from '../types';
import { toPromiseSrc } from './src';

type ToPromise_F = <
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  TC extends types.PrimitiveObject = types.PrimitiveObject,
>(
  events: E,
  promisees: P,
  src: PromiseeConfig,
  promises?: types.NOmit<SimpleMachineOptions<E, P, Pc, TC>, 'initials'>,
) => Promisee<E, P, Pc, TC>;

/**
 * Converts a promise config to a promisee object with a source and transitions.
 * @param events of type {@linkcode EventsMap}, the events map.
 * @param promisees of type {@linkcode PromiseeMap}, the promisees map.
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
  promisees,
  promise,
  options,
) => {
  const src = toPromiseSrc(
    events,
    promisees,
    promise.src,
    options?.promises,
  );

  const then = toArray
    .typed(promise.then)
    .map(config => toTransition(events, promisees, config, options));

  const _catch = toArray
    .typed(promise.catch)
    .map(config => toTransition(events, promisees, config, options));

  const _finally = toArray.typed(promise.finally).map(config => {
    const check1 = typeof config === 'object' && 'actions' in config;
    if (check1) return toTransition(events, promisees, config, options);

    return toTransition(events, promisees, { actions: config }, options);
  });

  const out = { src, then, catch: _catch, finally: _finally } as any;

  const { description } = promise;
  if (description) out.description = description;

  return out;
};
