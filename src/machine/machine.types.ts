import type { Fn, NOmit } from '@bemedev/types';
import type { ActionConfig, ActionResult, ActionResultFn } from '~actions';
import type { EventArg, EventsMap, PromiseeMap, ToEvents } from '~events';
import type { DefinedValue } from '~guards';
import type { NodeConfigWithInitials, StateValue } from '~states';
import type { FnMap, FnR, KeyU, PrimitiveObject } from '~types';
import type { Decompose3 } from './functions';
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
 * @template :  {@linkcode PrimitiveObject} [Tc] - type of the context
 * @template :  {@linkcode SimpleMachineOptions2} [Mo] - type of the machine options
 */
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

/**
 * Simple representation of a machine with meaningful properties.
 *
 * @template :  {@linkcode EventsMap} [E] - type of the events map
 * @template :  {@linkcode PromiseeMap} [P] - type of the promisees map
 * @template :  any [Pc] - type of the private context
 * @template :  {@linkcode PrimitiveObject} [Tc] - type of the context
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

export type AssignAction_F<
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
) => ActionResultFn<E, P, Pc, Tc>;

export type ResendAction_F<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (event: EventArg<E>) => ActionResultFn<E, P, Pc, Tc>;

export type VoidAction_F<
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
) => ActionResultFn<E, P, Pc, Tc>;

export type SendAction_F<
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
    { to: string; event: EventArg<EventsMapFrom<T>> }
  >,
) => ActionResultFn<E, P, Pc, Tc>;

export type ValueCheckerGuard_F<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (
  path: DefinedValue<Pc, Tc>,
  ...values: any[]
) => FnR<E, P, Pc, Tc, boolean>;

export type DefineGuard_F<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (path: DefinedValue<Pc, Tc>) => FnR<E, P, Pc, Tc, boolean>;

export type ChildProvider_F<
  E extends EventsMap,
  P extends PromiseeMap,
  Pc,
> = <
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

export type AllActions_F<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = AssignAction_F<E, P, Pc, Tc> | VoidAction_F<E, P, Pc, Tc>;

export type DebounceAction_F<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = <T extends ActionResultFn<E, P, Pc, Tc>>(
  fn: T,
  options: {
    ms?: number;
    id: string;
  },
) => ActionResultFn<E, P, Pc, Tc>;

export type AddOptionsParam_F<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  Mo extends NOmit<SimpleMachineOptions2, 'initials'> = NOmit<
    SimpleMachineOptions2,
    'initials'
  >,
> = (option: {
  isDefined: DefineGuard_F<E, P, Pc, Tc>;
  isNotDefined: DefineGuard_F<E, P, Pc, Tc>;
  isValue: ValueCheckerGuard_F<E, P, Pc, Tc>;
  isNotValue: ValueCheckerGuard_F<E, P, Pc, Tc>;
  createChild: ChildProvider_F<E, P, Pc>;
  assign: AssignAction_F<E, P, Pc, Tc>;
  voidAction: VoidAction_F<E, P, Pc, Tc>;
  sender: SendAction_F<E, P, Pc, Tc>;
  debounce: DebounceAction_F<E, P, Pc, Tc>;
  resend: ResendAction_F<E, P, Pc, Tc>;
  forceSend: ResendAction_F<E, P, Pc, Tc>;
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
> = (option: AddOptionsParam_F<E, P, Pc, Tc, Mo>) => void;

/**
 * Represents a scheduled action with its data and execution time.
 *
 * @template :  any [Pc] - type of the private context
 * @template :  {@linkcode PrimitiveObject} [Tc] - type of the context
 *
 * @see {@linkcode ActionResult} for the result of the action.
 */
export type ScheduledData<
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = { data: ActionResult<Pc, Tc>; ms: number; id: string };
