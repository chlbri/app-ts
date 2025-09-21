import type { ActionConfig, ActionResult, ActionResultFn } from '#actions';
import type { EventArg, EventsMap, PromiseeMap, ToEvents } from '#events';
import type { DefinedValue } from '#guards';
import type { NodeConfig, StateValue } from '#states';
import type { Decompose } from '@bemedev/decompose';
import type { types } from '@bemedev/types';
import type { FnMap, FnR, KeyU } from '~types';
import type { Rinit } from './constants';
import type {
  ChildS,
  Config,
  ContextFrom,
  EventsMapFrom,
  PrivateContextFrom,
  SimpleMachineOptions2,
  SubscriberType,
} from './types';

/**
 * Types for all meaningful elements of the machine.
 *
 * @template :  {@linkcode Config} [C] - type of the machine configuration
 * @template :  {@linkcode EventsMap} [E] - type of the events map
 * @template :  {@linkcode PromiseeMap} [P] - type of the promisees map
 * @template :  any [Pc] - type of the private context
 * @template :  {@linkcode types} [Tc] - type of the context
 * @template :  {@linkcode SimpleMachineOptions2} [Mo] - type of the machine options
 */
export type Elements<
  C extends Config = Config,
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
  Mo extends SimpleMachineOptions2 = SimpleMachineOptions2,
> = {
  config: C;
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
  node?: NodeConfig,
) => ActionConfig[];

/**
 * Simple representation of a machine with meaningful properties.
 *
 * @template :  {@linkcode EventsMap} [E] - type of the events map
 * @template :  {@linkcode PromiseeMap} [P] - type of the promisees map
 * @template :  any [Pc] - type of the private context
 * @template :  {@linkcode types.PrimitiveObject} [Tc] - type of the context
 *
 * @see {@linkcode ToEvents} for converting events and promisees maps to a unified event type.
 * @see {@linkcode NodeConfigWithInitials}  for the structure of node configurations with initials.
 * @see {@linkcode StateValue} for the type of state values.
 * @see {@linkcode Fn} for creating functions
 *
 */
export interface AnyMachine<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
> {
  options: any;
  config: Config;
  flat: Record<string, any>;
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
  renew: any;
  initialConfig: NodeConfig;
  initialValue: StateValue;

  isInitial: types.Fn<[string], boolean>;
  retrieveParentFromInitial: types.Fn<[string], NodeConfig>;
  toNode: types.Fn<[StateValue], NodeConfig>;
}

export type AssignAction_F<
  E extends EventsMap,
  P extends PromiseeMap,
  Pc,
  Tc extends types.PrimitiveObject,
> = <
  D = Decompose<
    {
      pContext: Pc;
      context: Tc;
    },
    { object: 'both'; start: false; sep: '.' }
  >,
  K extends keyof D = keyof D,
  R = D[K],
>(
  key: K,
  fn: FnMap<E, P, Pc, Tc, R>,
) => ActionResultFn<E, P, Pc, Tc>;

export type ResendAction_F<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
> = (event: EventArg<E>) => ActionResultFn<E, P, Pc, Tc>;

export type TimeAction_F<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
> = (id: string) => ActionResultFn<E, P, Pc, Tc>;

export type VoidAction_F<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
> = (fn?: FnR<E, P, Pc, Tc, void>) => ActionResultFn<E, P, Pc, Tc>;

export type SendAction_F<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
> = <T extends AnyMachine>(
  _?: T,
) => (
  fn: FnMap<
    E,
    P,
    Pc,
    Tc,
    { to: string; event: EventArg<EventsMapFrom<T>> }
  >,
) => ActionResultFn<E, P, Pc, Tc>;

export type ValueCheckerGuard_F<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
> = (
  path: DefinedValue<Pc, Tc>,
  ...values: any[]
) => FnR<E, P, Pc, Tc, boolean>;

export type DefineGuard_F<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
> = (path: DefinedValue<Pc, Tc>) => FnR<E, P, Pc, Tc, boolean>;

export type ChildProvider_F<
  E extends EventsMap,
  P extends PromiseeMap,
  Pc = any,
> = <
  const T extends KeyU<'config' | 'context' | 'pContext'> = KeyU<
    'pContext' | 'context' | 'config'
  >,
>(
  machine: T,
  initials: {
    pContext: PrivateContextFrom<T>;
    context: ContextFrom<T>;
  },
  ...subscribers: SubscriberType<E, P, Pc, T>[]
) => ChildS<E, P, Pc, T>;

export type AllActions_F<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
> = AssignAction_F<E, P, Pc, Tc> | VoidAction_F<E, P, Pc, Tc>;

export type DebounceAction_F<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
> = <T extends ActionResultFn<E, P, Pc, Tc>>(
  fn: T,
  options: {
    ms?: number;
    id: string;
  },
) => ActionResultFn<E, P, Pc, Tc>;

export type BatchAction_F<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
> = <T extends ActionResultFn<E, P, Pc, Tc>>(
  ...fns: T[]
) => ActionResultFn<E, P, Pc, Tc>;

export type AddOptionsParam_F<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
  Mo extends SimpleMachineOptions2 = SimpleMachineOptions2,
> = (option: {
  isDefined: DefineGuard_F<E, P, Pc, Tc>;
  isNotDefined: DefineGuard_F<E, P, Pc, Tc>;
  isValue: ValueCheckerGuard_F<E, P, Pc, Tc>;
  isNotValue: ValueCheckerGuard_F<E, P, Pc, Tc>;
  createChild: ChildProvider_F<E, P, Pc>;
  assign: AssignAction_F<E, P, Pc, Tc>;
  batch: BatchAction_F<E, P, Pc, Tc>;
  voidAction: VoidAction_F<E, P, Pc, Tc>;
  sendTo: SendAction_F<E, P, Pc, Tc>;
  debounce: DebounceAction_F<E, P, Pc, Tc>;
  resend: ResendAction_F<E, P, Pc, Tc>;
  /**
   * Force send action, performs the action regardless of the current state.
   */
  forceSend: ResendAction_F<E, P, Pc, Tc>;
  pauseActivity: TimeAction_F<E, P, Pc, Tc>;
  resumeActivity: TimeAction_F<E, P, Pc, Tc>;
  stopActivity: TimeAction_F<E, P, Pc, Tc>;
  pauseTimer: TimeAction_F<E, P, Pc, Tc>;
  resumeTimer: TimeAction_F<E, P, Pc, Tc>;
  stopTimer: TimeAction_F<E, P, Pc, Tc>;
  rinitFn: () => Rinit;
}) => Mo | undefined;

export type AddOptions_F<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
  Mo extends SimpleMachineOptions2 = SimpleMachineOptions2,
> = (option: AddOptionsParam_F<E, P, Pc, Tc, Mo>) => void;

/**
 * Represents a scheduled action with its data and execution time.
 *
 * @template :  any [Pc] - type of the private context
 * @template :  {@linkcode types.PrimitiveObject} [Tc] - type of the context
 *
 * @see {@linkcode ActionResult} for the result of the action.
 */
export type ScheduledData<
  Pc = any,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
> = { data: ActionResult<Pc, Tc>; ms: number; id: string };

export type SendToEvent<T = any> = {
  to: string;
  event: T;
};

export type ExtendedActionsParams<
  E extends EventsMap = EventsMap,
  Pc = any,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
> = Partial<{
  scheduled: ScheduledData<Pc, Tc>;
  resend: EventArg<E>;
  forceSend: EventArg<E>;
  pauseActivity: string;
  resumeActivity: string;
  stopActivity: string;
  pauseTimer: string;
  resumeTimer: string;
  stopTimer: string;
  sentEvent: SendToEvent;
}>;

export type TimeActionsTypes =
  | 'pauseActivity'
  | 'resumeActivity'
  | 'stopActivity'
  | 'pauseTimer'
  | 'resumeTimer'
  | 'stopTimer';

export type _ActionTypes =
  | 'assign'
  | 'void'
  | 'sendTo'
  | 'resend'
  | 'forceSend'
  | 'debounce'
  | TimeActionsTypes;

export type ActionTypes = `actions.${_ActionTypes}`;

export type AppTypes =
  | ActionTypes
  | 'guards'
  | 'pContext'
  | 'context'
  | 'promisees';
