import type { EventsMap, PromiseeMap } from '~events';
import type {
  ChildS,
  Config,
  ContextFrom,
  PrivateContextFrom,
  Subscriber,
} from '~machines';
import type { KeyU, PrimitiveObject } from '~types';

export type CreateConfig_F = <const T extends Config>(config: T) => T;

export const createConfig: CreateConfig_F = config => config;

export type CreateChildS_F = <
  const T extends KeyU<'preConfig' | 'context' | 'pContext'>,
  const E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  const Tc extends PrimitiveObject = PrimitiveObject,
>(
  machine: T,
  initials: {
    pContext: PrivateContextFrom<T>;
    context: ContextFrom<T>;
  },
  ...subscribers: Subscriber<E, P, Tc, T>[]
) => ChildS<E, P, Tc, T>;

export type CreateChild_F<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Tc extends PrimitiveObject = PrimitiveObject,
> = <const T extends KeyU<'preConfig' | 'context' | 'pContext'>>(
  machine: T,
  initials: {
    pContext: PrivateContextFrom<T>;
    context: ContextFrom<T>;
  },
  ...subscribers: Subscriber<E, P, Tc, T>[]
) => ChildS<E, P, Tc, T>;

export const createChildS: CreateChildS_F = (
  machine,
  initials,
  subscribers,
) => ({
  machine,
  initials,
  subscribers,
});
