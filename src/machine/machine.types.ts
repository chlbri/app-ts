import type { Fn, NOmit } from '@bemedev/types';
import type { Action } from '~actions';
import type { EventsMap, ToEvents } from '~events';
import type { DefinedValue } from '~guards';
import type { Machine } from '~machine';
import type { NodeConfigWithInitials, StateValue } from '~states';
import type { KeyU, PrimitiveObject } from '~types';
import type {
  ChildS,
  Config,
  ConfigWithInitials,
  ContextFrom,
  MachineOptions,
  PrivateContextFrom,
  SimpleMachineOptions2,
  Subscriber,
} from './types';

export type _ProvideInitials_F<C extends Config> = (
  initials: MachineOptions<C>['initials'],
) => ConfigWithInitials;

export type ProvideInitials_F<C extends Config> = (
  initials: MachineOptions<C>['initials'],
) => Machine<C>;

export type _ProvideActions_F<T> = (actions: T) => void;

export type Elements<
  C extends Config = Config,
  E extends EventsMap = EventsMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  Mo extends SimpleMachineOptions2 = SimpleMachineOptions2,
> = {
  config: C;
  initials?: Mo['initials'];
  pContext: Pc;
  events: E;
  context: Tc;
  actions?: Mo['actions'];
  guards?: Mo['predicates'];
  delays?: Mo['delays'];
  promises?: Mo['promises'];
  machines?: Mo['machines'];
};

export type GetIO_F = (
  key: 'exit' | 'entry',
  node: NodeConfigWithInitials,
) => string[];

export interface AnyMachine<
  E extends EventsMap = EventsMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> {
  preConfig: Config;
  postConfig: NodeConfigWithInitials;
  initials: any;
  context: Tc;
  pContext: Pc;
  eventsMap: E;
  events: ToEvents<E>;
  mo: any;
  actions: any;
  predicates: any;
  delays: any;
  promises: any;
  machines: any;
  action: Action<E, Pc, Tc>;
  postFlat: NodeConfigWithInitials;
  renew: any;
  initialConfig: NodeConfigWithInitials;
  initialValue: StateValue;

  addInitials: Fn<[any], any>;
  provideInitials: Fn<[any], any>;

  addActions: Fn<[any], any>;
  provideActions: Fn<[any], any>;

  addPredicates: Fn<[any], any>;
  providePredicates: Fn<[any], any>;

  addDelays: Fn<[any], any>;
  provideDelays: Fn<[any], any>;

  addPromises: Fn<[any], any>;
  providePromises: Fn<[any], any>;

  addMachines: Fn<[any], any>;
  provideMachines: Fn<[any], any>;

  providePrivateContext: Fn<[any], any>;
  provideContext: Fn<[any], any>;
  provideEvents: Fn<[any], any>;

  isInitial: Fn<[string], boolean>;
  retrieveParentFromInitial: Fn<[string], NodeConfigWithInitials>;
  toNode: Fn<[StateValue], NodeConfigWithInitials>;
}

export type AddOption_F<
  E extends EventsMap = EventsMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  Mo extends NOmit<SimpleMachineOptions2, 'initials'> = NOmit<
    SimpleMachineOptions2,
    'initials'
  >,
> = (option: {
  isDefined: (
    path: DefinedValue<E, Pc, Tc>,
  ) => (pContext: Pc, context: Tc, eventsMap: ToEvents<E>) => boolean;
  isNotDefined: (
    path: DefinedValue<E, Pc, Tc>,
  ) => (pContext: Pc, context: Tc, eventsMap: ToEvents<E>) => boolean;
  isValue: (
    path: DefinedValue<E, Pc, Tc>,
    ...values: any[]
  ) => (pContext: Pc, context: Tc, eventsMap: ToEvents<E>) => boolean;
  isNotValue: (
    path: DefinedValue<E, Pc, Tc>,
    ...values: any[]
  ) => (pContext: Pc, context: Tc, eventsMap: ToEvents<E>) => boolean;
  createChild: <
    const T extends KeyU<'preConfig' | 'context' | 'pContext'> = KeyU<
      'pContext' | 'context' | 'preConfig'
    >,
  >(
    machine: T,
    initials: {
      pContext: PrivateContextFrom<T>;
      context: ContextFrom<T>;
    },
    ...subscribers: Subscriber<E, Tc, T>[]
  ) => ChildS<E, Tc, T>;
}) => Mo | undefined;

export type AddOptions_F<
  E extends EventsMap = EventsMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  Mo extends NOmit<SimpleMachineOptions2, 'initials'> = NOmit<
    SimpleMachineOptions2,
    'initials'
  >,
> = (option: AddOption_F<E, Pc, Tc, Mo>) => void;
