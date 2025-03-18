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

export const createChildS: CreateChildS_F = (
  machine,
  initials,
  subscribers,
) => ({
  machine,
  initials,
  subscribers,
});
