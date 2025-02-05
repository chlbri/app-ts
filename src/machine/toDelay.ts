import { ERRORS } from '~constants';
import { defaultReturn } from '~utils';
import { reduceFnMap } from './reduceFnMap';
import type { ToDelay_F } from './types';

export const toDelay: ToDelay_F = ({ delays, delay, events }) => {
  const out = (error: Error, _return?: any) => {
    return defaultReturn({
      config: {
        strict: false,
        value: undefined,
      },
      _return,
      error,
    });
  };

  if (!delay) return out(ERRORS.delay.notDefined.error);

  const fn = delays?.[delay];
  const check = typeof fn === 'number';
  if (check) return () => fn;

  const func = fn ? reduceFnMap({ events, fn }) : undefined;

  return out(ERRORS.delay.notProvided.error, func);
};
