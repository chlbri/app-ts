import type { EventsMap } from '~events';
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

export type createChild_F = <
  const E extends EventsMap = EventsMap,
  const Tc extends PrimitiveObject = PrimitiveObject,
  const T extends KeyU<'preConfig' | 'context' | 'pContext'> = KeyU<
    'preConfig' | 'context' | 'pContext'
  >,
>(
  machine: T,
  initials: {
    pContext: PrivateContextFrom<T>;
    context: ContextFrom<T>;
  },
  ...subscribers: Subscriber<E, Tc, T>[]
) => ChildS<E, Tc, T>;

export const createChild: createChild_F = (
  machine,
  initials,
  subscribers,
) => ({
  machine,
  initials,
  subscribers,
});
