import type { PrimitiveObject } from '#bemedev/globals/types';
import type { ActorsConfigMap, EventObject, EventsMap } from '#events';
import type {
  ConfigDef,
  NoExtraKeysConfigDef,
  SimpleMachineOptions2,
} from '#machines';
import type { AnyMachine } from './machine/machine.types';

/**
 * The Register interface is augmented by the CLI-generated `app.gen.ts` file.
 * It uses the TanStack Start pattern of `declare module` augmentation
 * to wire pre-resolved types to machine paths.
 *
 * @see https://www.npmjs.com/package/@bemedev/app-ts
 */
export interface Register extends Record<
  string,
  {
    paths: {
      map: NoExtraKeysConfigDef<ConfigDef>;
      all: string;
    };
    events: {
      map: EventsMap;
      all: EventObject;
    };

    actors: ActorsConfigMap;
    pContext: any;
    context: PrimitiveObject;
    tags: string;
    options: SimpleMachineOptions2;
  }
  // oxlint-disable-next-line typescript/no-empty-object-type
> {}

const MACHINES: Record<string, AnyMachine> = {};

export function registerMachine<P extends string>(
  relativePath: P,
  machine: AnyMachine,
): void {
  MACHINES[relativePath] = machine;
}

export function getMachine<P extends keyof Register>(
  relativePath: P,
): Register[P] {
  return MACHINES[relativePath as string] as any;
}

export { MACHINES };
