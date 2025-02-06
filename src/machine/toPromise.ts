import { isDescriber } from 'src/types/primitives';
import { ERRORS } from '~constants';
import { asyncNothing } from '~promises';
import type { TransitionConfig } from '~transitions';
import { defaultReturn, toArray } from '~utils';
import { reduceFnMap } from './reduceFnMap';
import { toTransition } from './toTransition';
import type { ToPromise_F, ToPromiseSrc_F } from './types';

export const toPromiseSrc: ToPromiseSrc_F = ({
  events,
  src,
  promises,
  mode = 'normal',
}) => {
  const strict = mode === 'normal';
  const out = (error: Error, _return?: any) => {
    return defaultReturn({
      config: {
        strict,
        value: asyncNothing,
      },
      _return,
      error,
    });
  };

  if (isDescriber(src)) {
    const fn = promises?.[src.name];
    const func = fn
      ? reduceFnMap({
          events,
          fn,
        })
      : undefined;
    return out(ERRORS.promise.notDescribed.error, func);
  }

  const fn = promises?.[src];

  const func = fn
    ? reduceFnMap({
        events,
        fn,
      })
    : undefined;

  return out(ERRORS.promise.notProvided.error, func);
};

export const toPromise: ToPromise_F = ({
  events,
  promise,
  options,
  mode,
}) => {
  const src = toPromiseSrc({
    events,
    src: promise.src,
    promises: options?.promises,
    mode,
  });

  const then = toArray<TransitionConfig>(promise.then).map(config =>
    toTransition({ config, options: options as any, events, mode }),
  );

  const _catch = toArray<TransitionConfig>(promise.catch).map(config =>
    toTransition({ config, options: options as any, events, mode }),
  );

  const _finally = toArray<TransitionConfig>(promise.finally).map(config =>
    toTransition({ config, options: options as any, events, mode }),
  );

  const out = { src, then, catch: _catch, finally: _finally } as any;

  const { id, description } = promise;
  if (id) out.id = id;
  if (description) out.description = description;

  return out;
};
