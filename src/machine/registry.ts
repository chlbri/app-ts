import type { AnyMachine } from './machine.types';

/**
 * The Register interface is augmented by the CLI-generated `app.gen.ts` file.
 * It uses the TanStack Start pattern of `declare module` augmentation
 * to wire pre-resolved types to machine paths.
 *
 * @see https://www.npmjs.com/package/@bemedev/app-ts
 */
export interface Register {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  machines: {};
}

const MACHINES: Record<string, AnyMachine> = {};

export function registerMachine<P extends string>(
  relativePath: P,
  machine: AnyMachine,
): void {
  MACHINES[relativePath] = machine;
}

export function getMachine<P extends keyof Register['machines']>(
  relativePath: P,
): Register['machines'][P] {
  return MACHINES[relativePath as string] as any;
}

export { MACHINES };
