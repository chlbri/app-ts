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

export const toMachine: ToMachine_F = (machine, machines) => {
  if (!machine) return;

  if (isDescriber(machine)) {
    return machines?.[machine.name];
  }

  const child = machines?.[machine];
  return child;
};
