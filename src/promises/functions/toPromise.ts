import { toArray } from '@bemedev/basifun';
import type { NOmit } from '@bemedev/types';
import type { EventsMap } from '~events';
import type { SimpleMachineOptions } from '~machines';
import type { PromiseConfig } from '~promises';
import { toTransition } from '~transitions';
import type { PrimitiveObject } from '~types';
import type { Promisee } from '../types';
import { toPromiseSrc } from './src';

export type ToPromise_F = <
  E extends EventsMap = EventsMap,
  Pc = any,
  TC extends PrimitiveObject = PrimitiveObject,
>(
  events: E,
  src: PromiseConfig,
  promises?: NOmit<SimpleMachineOptions<E, Pc, TC>, 'initials'>,
) => Promisee<E, Pc, TC>;

export const toPromise: ToPromise_F = (events, promise, options) => {
  const src = toPromiseSrc(events, promise.src, options?.promises);

  const then = toArray
    .typed(promise.then)
    .map(config => toTransition(events, config, options));

  const _catch = toArray
    .typed(promise.catch)
    .map(config => toTransition(events, config, options));

  const _finally = toArray.typed(promise.finally).map(config => {
    const check1 = typeof config === 'object' && 'actions' in config;
    if (check1) return toTransition(events, config, options);

    return toTransition(events, { actions: config }, options);
  });

  const out = { src, then, catch: _catch, finally: _finally } as any;

  const { description } = promise;
  if (description) out.description = description;

  return out;
};
