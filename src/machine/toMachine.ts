import { ERRORS } from '~constants';
import { DEFAULT_MACHINE } from '~machine';
import { isDescriber } from '~types';
import { defaultReturn, nothing } from '~utils';
import { reduceFnMap } from './reduceFnMap';
import type { Child2, ToMachine_F } from './types';

export const toMachine: ToMachine_F = ({
  events,
  mode,
  machine,
  machines,
}) => {
  const strict = mode !== 'normal';
  const value: Child2 = () => ({
    machine: DEFAULT_MACHINE,
    subscriber: nothing,
  });

  const out = (error: Error, _return?: any) => {
    return defaultReturn({
      config: {
        strict,
        value,
      },
      _return,
      error,
    });
  };

  if (!machine) return out(ERRORS.machine.notDefined.error);

  if (isDescriber(machine)) {
    const fn = machines?.[machine.name];
    const func = fn ? reduceFnMap({ events, fn }) : undefined;
    return out(ERRORS.action.notDescribed.error, func);
  }

  const fn = machines?.[machine];
  const func = fn ? reduceFnMap({ events, fn }) : undefined;

  return out(ERRORS.action.notProvided.error, func);
};
