import type {
  ActionConfig,
  ActionResult,
  ActionResultFn,
} from 'src/actions/types';

import type { DefinedValue } from 'src/guards/types';
import type { NodeConfig, StateExtended, StateValue } from '#states';
import type { Decompose } from '@bemedev/decompose';

import type {
  Fn,
  PrimitiveObject,
  Ru,
  SubTypeLow,
} from '#bemedev/globals/types';
import type {
  ActorsConfigMap,
  EventArg,
  EventsMap,
  ToEvents2,
} from '#events';
import type { FnMap, FnR } from 'src/types/primitives';
import type { NoExtraKeysStrict, ValuesOf } from '~types';
import type { Config, EventsMapFrom } from './types';
import type { SimpleMachineOptions2 } from './types';

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
  C extends Config,
  E extends EventsMap,
  A extends ActorsConfigMap,
  Pc,
  Tc extends PrimitiveObject,
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
  fn: FnMap<C, E, A, Pc, Tc, D[K]>,
) => ActionResultFn<C, E, A, Pc, Tc>;

export type ResendAction_F<
  C extends Config = Config,
  E extends EventsMap = EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (event: EventArg<E>) => ActionResultFn<C, E, A, Pc, Tc>;

export type TimeAction_F<
  C extends Config = Config,
  E extends EventsMap = EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (id: string) => ActionResultFn<C, E, A, Pc, Tc>;

export type VoidAction_F<
  C extends Config = Config,
  E extends EventsMap = EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (fn?: FnMap<C, E, A, Pc, Tc, void>) => ActionResultFn<C, E, A, Pc, Tc>;

export type ByKey_F<
  C extends Config = Config,
  E extends EventsMap = EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = <
  S extends StateExtended<C, Pc, Tc, ToEvents2<E, A>, A>,
  D = Decompose<S, { object: 'both'; start: false; sep: '.' }>,
  K extends keyof D & string = keyof D & string,
>(
  key: K,
) => D[K];

export type FilterAction_F<
  C extends Config,
  E extends EventsMap,
  A extends ActorsConfigMap,
  Pc,
  Tc extends PrimitiveObject,
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
) => ActionResultFn<C, E, A, Pc, Tc>;

export type EraseAction_F<
  C extends Config,
  E extends EventsMap,
  A extends ActorsConfigMap,
  Pc,
  Tc extends PrimitiveObject,
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
) => ActionResultFn<C, E, A, Pc, Tc>;

export type DirectMerge_F<
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = Fn<[result?: ActionResult<Pc, Tc>], void>;

export type SendAction_F<
  C extends Config = Config,
  E extends EventsMap = EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = <T extends AnyMachine>(
  _?: T,
) => (
  fn: FnMap<
    C,
    E,
    A,
    Pc,
    Tc,
    { to: string; event: EventArg<EventsMapFrom<T>> }
  >,
) => ActionResultFn<C, E, A, Pc, Tc>;

export type ValueCheckerGuard_F<
  C extends Config = Config,
  E extends EventsMap = EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (
  path: DefinedValue<Pc, Tc>,
  ...values: any[]
) => FnR<C, E, A, Pc, Tc, boolean>;

export type DefineGuard_F<
  C extends Config = Config,
  E extends EventsMap = EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (path: DefinedValue<Pc, Tc>) => FnR<C, E, A, Pc, Tc, boolean>;

export type AllActions_F<
  C extends Config = Config,
  E extends EventsMap = EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = AssignAction_F<C, E, A, Pc, Tc> | VoidAction_F<C, E, A, Pc, Tc>;

export type DebounceAction_F<
  C extends Config = Config,
  E extends EventsMap = EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = <T extends ActionResultFn<C, E, A, Pc, Tc>>(
  fn: T,
  options: {
    ms?: number;
    id: string;
  },
) => ActionResultFn<C, E, A, Pc, Tc>;

export type BatchAction_F<
  C extends Config = Config,
  E extends EventsMap = EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = <T extends ActionResultFn<C, E, A, Pc, Tc> | undefined>(
  ...fns: T[]
) => ActionResultFn<C, E, A, Pc, Tc>;

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
  C extends Config = Config,
  E extends EventsMap = EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = {
  isDefined: DefineGuard_F<C, E, A, Pc, Tc>;
  isNotDefined: DefineGuard_F<C, E, A, Pc, Tc>;
  isValue: ValueCheckerGuard_F<C, E, A, Pc, Tc>;
  isNotValue: ValueCheckerGuard_F<C, E, A, Pc, Tc>;
  assign: AssignAction_F<C, E, A, Pc, Tc>;
  batch: BatchAction_F<C, E, A, Pc, Tc>;
  filter: FilterAction_F<C, E, A, Pc, Tc>;
  erase: EraseAction_F<C, E, A, Pc, Tc>;
  voidAction: VoidAction_F<C, E, A, Pc, Tc>;
  sendTo: SendAction_F<C, E, A, Pc, Tc>;
  debounce: DebounceAction_F<C, E, A, Pc, Tc>;
  resend: ResendAction_F<C, E, A, Pc, Tc>;
  /**
   * Force send action, performs the action regardless of the current state.
   */
  forceSend: ResendAction_F<C, E, A, Pc, Tc>;
  pauseActivity: TimeAction_F<C, E, A, Pc, Tc>;
  resumeActivity: TimeAction_F<C, E, A, Pc, Tc>;
  stopActivity: TimeAction_F<C, E, A, Pc, Tc>;
  pauseTimer: TimeAction_F<C, E, A, Pc, Tc>;
  resumeTimer: TimeAction_F<C, E, A, Pc, Tc>;
  stopTimer: TimeAction_F<C, E, A, Pc, Tc>;
  // merge: DirectMerge_F<Pc, Tc>;
  // emitter: Emitter<E, P, Pc, Tc>;
};

export type AddOptionsParam_F<
  C extends Config = Config,
  E extends EventsMap = EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  Mo extends SimpleMachineOptions2 = SimpleMachineOptions2,
> = (
  option: AddOption<C, E, A, Pc, Tc>,
  /**
   * Access to previously defined options from previous addOptions or provideOptions calls.
   * Provides actions, predicates, emitters, machines, promises, and delays.
   */
  legacyOptions: {
    _legacy: LegacyOptions<Mo>;
  },
) => Mo;

export type AddOptions_F<
  C extends Config = Config,
  E extends EventsMap = EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  Mo extends SimpleMachineOptions2 = SimpleMachineOptions2,
> = <T extends Mo>(
  option: AddOptionsParam_F<C, E, A, Pc, Tc, NoExtraKeysStrict<T, Mo>>,
) => T;

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
