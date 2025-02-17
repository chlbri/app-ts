import type { Fn } from '@bemedev/types';
import type { PrimitiveObject } from 'src/types/primitives';
import type { Action } from '~actions';
import type { EventsMap, ToEvents } from '~events';
import type { Machine } from '~machine';
import type { NodeConfigWithInitials, StateValue } from '~states';
import type {
  Config,
  ConfigWithInitials,
  MachineOptions,
  SimpleMachineOptions2,
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
  node: NodeConfigWithInitials,
  key: 'exit' | 'entry',
) => string[];

export type GetIO2_F = (node: NodeConfigWithInitials) => string[];

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
  errorsCollector: string[];

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

  isValue: Fn;
  isNotValue: Fn;
  isDefined: Fn;
}
