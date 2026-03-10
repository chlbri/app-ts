import type {
  Action2,
  ActionConfig,
  ActionResult,
} from 'src/actions/types';

import type { NodeConfig, StateExtended, StateValue } from '#states';
import type { Decompose } from '@bemedev/decompose';
import type { DefinedValue } from 'src/guards/types';

import type {
  Fn,
  PrimitiveObject,
  Ru,
  SubTypeLow,
} from '#bemedev/globals/types';
import type {
  ActorsConfigMap,
  EventArg,
  EventArgAll,
  EventObject,
  EventsMap,
  ToEvents2,
} from '#events';
import type { FnMap, FnR } from 'src/types/primitives';
import type { ValuesOf } from '~types';
import type {
  Config,
  EventsMapFrom,
  SimpleMachineOptions2,
} from './types';

/**
 * Types for all meaningful elements of the machine.
 *
 * @template :  {@linkcode Config} [C] - type of the machine configuration
 * @template :  {@linkcode EventsMap} [E] - type of the events map
 * @template :  {@linkcode ActorsConfigMap} [A] - type of the actors configuration map
 * @template :  any [Pc] - type of the private context
 * @template :  {@linkcode types} [Tc] - type of the context
 * @template :  {@linkcode SimpleMachineOptions2} [Mo] - type of the machine options
 */
export type Elements<
  C extends Config = Config,
  E extends EventsMap = EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  Mo extends SimpleMachineOptions2 = SimpleMachineOptions2,
> = {
  config: C;
  pContext: Pc;
  events: E;
  actorsMap: A;
  context: Tc;
  actions?: Mo['actions'];
  predicates?: Mo['predicates'];
  delays?: Mo['delays'];
  actors?: Mo['actors'];
};

export type GetIO_F = (
  key: 'exit' | 'entry',
  node?: NodeConfig,
) => ActionConfig[];

/**
 * Simple representation of a machine with meaningful properties.
 *
 * @template :  {@linkcode EventsMap} [E] - type of the events map
 * @template :  {@linkcode ActorsConfigMap} [A] - type of the actors configuration map
 * @template :  any [Pc] - type of the private context
 * @template :  {@linkcode PrimitiveObject} [Tc] - type of the context
 *
 * @see {@linkcode ToEvents2} for converting events and actors maps to a unified event type.
 * @see {@linkcode NodeConfigWithInitials}  for the structure of node configurations with initials.
 * @see {@linkcode StateValue} for the type of state values.
 * @see {@linkcode Fn} for creating functions
 *
 */
export interface AnyMachine<
  E extends EventsMap = EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> {
  options: any;
  config: Config;
  flat: Record<string, any>;
  context: Tc;
  pContext: Pc;
  eventsMap: E;
  actorsMap: A;
  __events: ToEvents2<E, A>;
  __state: any;
  actions: any;
  predicates: any;
  delays: any;
  promises: any;
  children: any;
  renew: any;
  initialConfig: NodeConfig;
  initialValue: StateValue;

  isInitial: Fn<[string], boolean>;
  retrieveParentFromInitial: Fn<[string], NodeConfig>;
  toNode: Fn<[StateValue], NodeConfig>;
}

export type AssignAction_F<
  E extends EventObject = EventObject,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
> = <
  D = Decompose<
    {
      pContext: Pc;
      context: Tc;
    },
    { object: 'both'; start: false; sep: '.' }
  >,
  K extends keyof D = keyof D,
>(
  key: K,
  fn: FnMap<E, Pc, Tc, T, D[K]>,
) => Action2<E, Pc, Tc, T>;

export type ResendAction_F<
  E extends EventObject = EventObject,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
> = (event: EventArgAll<E>) => Action2<E, Pc, Tc, T>;

export type TimeAction_F<
  E extends EventObject = EventObject,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
> = (id: string) => Action2<E, Pc, Tc, T>;

export type VoidAction_F<
  E extends EventObject = EventObject,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
> = (fn?: FnMap<E, Pc, Tc, T, void>) => Action2<E, Pc, Tc, T>;

export type ByKey_F<
  E extends EventObject = EventObject,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
> = <
  S extends StateExtended<E, Pc, Tc, T>,
  D = Decompose<S, { object: 'both'; start: false; sep: '.' }>,
  K extends keyof D & string = keyof D & string,
>(
  key: K,
) => D[K];

export type FilterAction_F<
  E extends EventObject = EventObject,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
> = <
  D = Decompose<
    {
      pContext: Pc;
      context: Tc;
    },
    { object: 'object'; start: false; sep: '.' }
  >,
  K extends keyof D & string = keyof D & string,
>(
  key: K,
  fn: K extends string
    ? D[K] extends Array<infer Item>
      ? (item: Item, index: number, array: Item[]) => boolean
      : D[K] extends Ru
        ? (value: ValuesOf<D[K]>, all: D[K]) => boolean
        : never
    : never,
) => Action2<E, Pc, Tc, T>;

export type EraseAction_F<
  E extends EventObject = EventObject,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
> = <
  D extends object = Extract<
    Decompose<
      {
        pContext: Pc;
        context: Tc;
      },
      { object: 'both'; start: false; sep: '.' }
    >,
    object
  >,
  DD = SubTypeLow<D, undefined>,
  K extends keyof DD & string = keyof DD & string,
>(
  key: K,
) => Action2<E, Pc, Tc, T>;

export type DirectMerge_F<
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = Fn<[result?: ActionResult<Pc, Tc>], void>;

export type SendAction_F<
  E extends EventObject = EventObject,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
> = <M extends AnyMachine>(
  _?: M,
) => (
  fn: FnMap<
    E,
    Pc,
    Tc,
    T,
    { to: string; event: EventArg<EventsMapFrom<M>> }
  >,
) => Action2<E, Pc, Tc, T>;

export type ValueCheckerGuard_F<
  E extends EventObject = EventObject,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
> = (
  path: DefinedValue<Pc, Tc>,
  ...values: any[]
) => FnR<E, Pc, Tc, T, boolean>;

export type DefineGuard_F<
  E extends EventObject = EventObject,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
> = (path: DefinedValue<Pc, Tc>) => FnR<E, Pc, Tc, T, boolean>;

export type AllActions_F<
  E extends EventObject = EventObject,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
> = AssignAction_F<E, Pc, Tc, T> | VoidAction_F<E, Pc, Tc, T>;

export type DebounceAction_F<
  E extends EventObject = EventObject,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
> = <A extends Action2<E, Pc, Tc, T>>(
  fn: A,
  options: {
    ms?: number;
    id: string;
  },
) => Action2<E, Pc, Tc, T>;

export type BatchAction_F<
  E extends EventObject = EventObject,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
> = <A extends (Action2<E, Pc, Tc, T> | undefined)[]>(
  ...fns: A
) => Action2<E, Pc, Tc, T>;

/**
 * Type for the _legacy parameter containing previously defined options.
 */
export type LegacyOptions<
  Mo extends SimpleMachineOptions2 = SimpleMachineOptions2,
> = Readonly<{
  actions?: Mo['actions'];
  predicates?: Mo['predicates'];
  delays?: Mo['delays'];
  actors?: Mo['actors'];
}>;

export type AddOption<
  E extends EventObject = EventObject,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
> = {
  isDefined: DefineGuard_F<E, Pc, Tc, T>;
  isNotDefined: DefineGuard_F<E, Pc, Tc, T>;
  isValue: ValueCheckerGuard_F<E, Pc, Tc, T>;
  isNotValue: ValueCheckerGuard_F<E, Pc, Tc, T>;
  assign: AssignAction_F<E, Pc, Tc, T>;
  batch: BatchAction_F<E, Pc, Tc, T>;
  filter: FilterAction_F<E, Pc, Tc, T>;
  erase: EraseAction_F<E, Pc, Tc, T>;
  voidAction: VoidAction_F<E, Pc, Tc, T>;
  sendTo: SendAction_F<E, Pc, Tc, T>;
  debounce: DebounceAction_F<E, Pc, Tc, T>;
  resend: ResendAction_F<E, Pc, Tc, T>;
  /**
   * Force send action, performs the action regardless of the current state.
   */
  forceSend: ResendAction_F<E, Pc, Tc, T>;
  pauseActivity: TimeAction_F<E, Pc, Tc, T>;
  resumeActivity: TimeAction_F<E, Pc, Tc, T>;
  stopActivity: TimeAction_F<E, Pc, Tc, T>;
  pauseTimer: TimeAction_F<E, Pc, Tc, T>;
  resumeTimer: TimeAction_F<E, Pc, Tc, T>;
  stopTimer: TimeAction_F<E, Pc, Tc, T>;
  // merge: DirectMerge_F<Pc, Tc>;
  // emitter: Emitter<E, P, Pc, Tc>;
};

export type AddOptionsParam_F<
  E extends EventObject = EventObject,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
  Mo extends SimpleMachineOptions2 = SimpleMachineOptions2,
> = (
  option: AddOption<E, Pc, Tc, T>,
  /**
   * Access to previously defined options from previous addOptions or provideOptions calls.
   * Provides actions, predicates, emitters, machines, promises, and delays.
   */
  legacyOptions: {
    _legacy: LegacyOptions<Mo>;
  },
) => Mo | undefined;

export type AddOptions_F<
  E extends EventObject = EventObject,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
  Mo extends SimpleMachineOptions2 = SimpleMachineOptions2,
> = (option: AddOptionsParam_F<E, Pc, Tc, T, Mo>) => Mo | undefined;

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

export type SendToEvent<T = any> = {
  to: string;
  event: T;
};

export type ExtendedActionsParams<
  E extends EventsMap = EventsMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
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
