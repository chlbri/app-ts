import type { ConfigDef, NoExtraKeysConfigDef } from '#machines';
import type { ObjectT } from '@bemedev/typings';
import type { AnyMachine } from './machine/machine.types';

export type RegisterOptions = Record<
  'children' | 'emitters' | 'tags' | 'actions' | 'delays' | 'guards',
  string
>;

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
    events: string;

    options: RegisterOptions;
    pContext?: ObjectT;
    tags?: string;
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
