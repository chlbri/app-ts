import { isDefined } from '@bemedev/basifun';
import { ERRORS } from '~constants';
import { isDescriber } from '~types';
import { defaultReturn, nothing as value } from '~utils';
import { reduceFnMap } from './reduceFnMap';
import type { ToAction_F } from './types';

export const toAction: ToAction_F = ({
  events,
  action,
  actions,
  mode,
}) => {
  const out = (error: Error, _return?: any) => {
    return defaultReturn({
      config: {
        strict: mode !== 'normal',
        value,
      },
      _return,
      error,
    });
  };

  if (!isDefined(action)) return out(ERRORS.action.notDefined.error);

  if (isDescriber(action)) {
    const fn = actions?.[action.name];
    const func = fn ? reduceFnMap({ events, fn }) : undefined;
    return out(ERRORS.action.notDescribed.error, func);
  }

  const fn = actions?.[action];

  const func = fn ? reduceFnMap({ events, fn }) : undefined;

  return out(ERRORS.action.notProvided.error, func);
};
