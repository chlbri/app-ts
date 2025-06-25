import type { Fn, NOmit } from '@bemedev/types';
import type { ActionConfig, ActionResult } from '~actions';
import type { EventArg, EventsMap, PromiseeMap, ToEvents } from '~events';
import type { DefinedValue } from '~guards';
import type { Machine } from '~machine';
import type { NodeConfigWithInitials, StateValue } from '~states';
import type { FnMap, KeyU, PrimitiveObject } from '~types';
import type { Decompose3 } from './functions';
import type {
  ChildS,
  Config,
  ConfigWithInitials,
  ContextFrom,
  EventsMapFrom,
  MachineOptions,
  PrivateContextFrom,
  PromiseesMapFrom,
  SimpleMachineOptions2,
  SubscriberType,
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
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  Mo extends SimpleMachineOptions2 = SimpleMachineOptions2,
> = {
  config: C;
  initials: Mo['initials'];
  pContext: Pc;
  events: E;
  promisees: P;
  context: Tc;
  actions?: Mo['actions'];
  predicates?: Mo['predicates'];
  delays?: Mo['delays'];
  promises?: Mo['promises'];
  machines?: Mo['machines'];
};

export type GetIO_F = (
  key: 'exit' | 'entry',
  node?: NodeConfigWithInitials,
) => ActionConfig[];

export interface AnyMachine<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> {
  options: any;
  preConfig: Config;
  preflat: Record<string, any>;
  postConfig: NodeConfigWithInitials;
  initials: any;
  context: Tc;
  pContext: Pc;
  eventsMap: E;
  promiseesMap: P;
  __events: ToEvents<E, P>;
  actions: any;
  predicates: any;
  delays: any;
  promises: any;
  machines: any;
  postflat: NodeConfigWithInitials;
  renew: any;
  initialConfig: NodeConfigWithInitials;
  initialValue: StateValue;

  addInitials: Fn<[any], any>;

  isInitial: Fn<[string], boolean>;
  retrieveParentFromInitial: Fn<[string], NodeConfigWithInitials>;
  toNode: Fn<[StateValue], NodeConfigWithInitials>;
}

export type Assign_F<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = <
  D = Decompose3<{
    pContext: Pc;
    context: Tc;
  }>,
  K extends keyof D = keyof D,
  R = D[K],
>(
  key: K,
  fn: FnMap<E, P, Pc, Tc, R>,
) => (
  pContext: Pc,
  context: Tc,
  eventsMap: ToEvents<E, P>,
) => ActionResult<Pc, Tc>;

export type Void_F<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (
  fn: (
    pContext: Pc,
    context: Tc,
    eventsMap: ToEvents<E, P>,
  ) => void | undefined,
) => (
  pContext: Pc,
  context: Tc,
  eventsMap: ToEvents<E, P>,
) => ActionResult<Pc, Tc>;

export type Sender_F<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = <T extends AnyMachine>(
  _?: T,
) => (
  fn: FnMap<
    E,
    P,
    Pc,
    Tc,
    { to: string; event: EventArg<EventsMapFrom<T>, PromiseesMapFrom<T>> }
  >,
) => (
  pContext: Pc,
  context: Tc,
  eventsMap: ToEvents<E, P>,
) => ActionResult<Pc, Tc>;

export type AddOption_F<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  Mo extends NOmit<SimpleMachineOptions2, 'initials'> = NOmit<
    SimpleMachineOptions2,
    'initials'
  >,
> = (option: {
  isDefined: (
    path: DefinedValue<Pc, Tc>,
  ) => (pContext: Pc, context: Tc, eventsMap: ToEvents<E, P>) => boolean;
  isNotDefined: (
    path: DefinedValue<Pc, Tc>,
  ) => (pContext: Pc, context: Tc, eventsMap: ToEvents<E, P>) => boolean;
  isValue: (
    path: DefinedValue<Pc, Tc>,
    ...values: any[]
  ) => (pContext: Pc, context: Tc, eventsMap: ToEvents<E, P>) => boolean;
  isNotValue: (
    path: DefinedValue<Pc, Tc>,
    ...values: any[]
  ) => (pContext: Pc, context: Tc, eventsMap: ToEvents<E, P>) => boolean;
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
    ...subscribers: SubscriberType<E, P, Pc, T>[]
  ) => ChildS<E, P, Pc, T>;
  assign: Assign_F<E, P, Pc, Tc>;
  voidAction: Void_F<E, P, Pc, Tc>;
  sender: Sender_F<E, P, Pc, Tc>;
}) => Mo | undefined;

export type AddOptions_F<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  Mo extends NOmit<SimpleMachineOptions2, 'initials'> = NOmit<
    SimpleMachineOptions2,
    'initials'
  >,
> = (option: AddOption_F<E, P, Pc, Tc, Mo>) => void;
