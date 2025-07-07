import type { EventsMap, PromiseeMap } from '~events';
import type {
  ChildS,
  Config,
  ContextFrom,
  PrivateContextFrom,
  SubscriberType,
} from '~machines';
import type { KeyU } from '~types';
import { typings } from '~utils';

export type CreateConfig_F = <const T extends Config>(config: T) => T;

/**
 * Creates a machine configuration.
 * This function takes a configuration object and returns it as is.
 * It is a utility function to ensure that the configuration is of the correct type.
 *
 * @param value - The configuration object of type {@linkcode Config}.
 *
 * @returns The same configuration object of type {@linkcode Config}.
 *
 * @see {@linkcode typings.cast}
 */
export const createConfig: CreateConfig_F = typings.cast;

export type CreateChildS_F = <
  T extends KeyU<'preConfig' | 'context' | 'pContext'>,
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
>(
  machine: T,
  initials: {
    pContext: PrivateContextFrom<T>;
    context: ContextFrom<T>;
  },
  ...subscribers: SubscriberType<E, P, Pc, T>[]
) => ChildS<E, P, Pc, T>;

export type CreateChild_F<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
> = <const T extends KeyU<'preConfig' | 'context' | 'pContext'>>(
  machine: T,
  initials: {
    pContext: PrivateContextFrom<T>;
    context: ContextFrom<T>;
  },
  ...subscribers: SubscriberType<E, P, Pc, T>[]
) => ChildS<E, P, Pc, T>;

/**
 * Creates a child service for a machine.
 * @param machine of type {@linkcode KeyU}<'preConfig' | 'context' | 'pContext'> the machine to use for creating a child service.
 * @param initials - The initials for the child service, containing `pContext` and `context`.
 * @param subscribers - The subscribers to the child service to build.
 * @returns A {@linkcode ChildS} object representing the produced child service.
 */
export const createChildS: CreateChildS_F = (
  machine,
  initials,
  subscribers,
) => ({
  machine,
  initials,
  subscribers,
});
