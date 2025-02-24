import type { EventsMap } from '~events';
import { isDescriber, type PrimitiveObject } from '~types';
import type { ChildS, MachineConfig, MachineMap } from '../types';

export type ToMachine_F = <
  E extends EventsMap,
  Tc extends PrimitiveObject = PrimitiveObject,
>(
  machine: MachineConfig,
  machines?: MachineMap<E, Tc>,
) => (ChildS<E, Tc> & { id?: string }) | undefined;

export const toMachine: ToMachine_F = (machine, machines) => {
  if (!machine) return;

  if (isDescriber(machine)) {
    const out = machines?.[machine.name];
    if (!out) return;
    const id = machine.id;
    return { ...out, id };
  }

  return machines?.[machine];
};
