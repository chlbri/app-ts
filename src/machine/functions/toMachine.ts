import type { ActionConfig } from '~actions';
import type { EventsMap } from '~events';
import { isDescriber, type PrimitiveObject } from '~types';
import type { ChildS, MachineMap } from '../types';

export type ToMachine_F = <
  E extends EventsMap,
  Tc extends PrimitiveObject = PrimitiveObject,
>(
  machine?: ActionConfig,
  machines?: MachineMap<E, Tc>,
) => ChildS<E, Tc> | undefined;

export const toMachine: ToMachine_F = (_machine, machines) => {
  if (!_machine) return;

  if (isDescriber(_machine)) {
    return machines?.[_machine.name];
  }

  const child = machines?.[_machine];
  return child;
};
