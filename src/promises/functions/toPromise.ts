import { toArray } from '@bemedev/basifun';
import type { NOmit } from '@bemedev/types';
import type { EventsMap, PromiseeMap } from '~events';
import type { SimpleMachineOptions } from '~machines';
import type { PromiseConfig } from '~promises';
import { toTransition } from '~transitions';
import type { PrimitiveObject } from '~types';
import type { Promisee } from '../types';
import { toPromiseSrc } from './src';

export type ToPromise_F = <
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  TC extends PrimitiveObject = PrimitiveObject,
>(
  events: E,
  promisees: P,
  src: PromiseConfig,
  promises?: NOmit<SimpleMachineOptions<E, P, Pc, TC>, 'initials'>,
) => Promisee<E, P, Pc, TC>;

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
