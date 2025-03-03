import type { EventsMap, PromiseeMap } from '~events';
import { isDescriber, type PrimitiveObject } from '~types';
import type { ChildS, MachineConfig, MachineMap } from '../types';

export type ToMachine_F = <
  E extends EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Tc extends PrimitiveObject = PrimitiveObject,
>(
  machine: MachineConfig,
  machines?: MachineMap<E, P, Tc>,
) => (ChildS<E, P, Tc> & { id?: string }) | undefined;

export const toMachine: ToMachine_F = (machine, machines) => {
  if (isDescriber(machine)) {
    const out = machines?.[machine.name];
    if (!out) return;
    const id = machine.id;
    return { ...out, id };
  }

  return machines?.[machine];
};
