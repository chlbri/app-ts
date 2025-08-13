import type {
  Action,
  Action2,
  ActionConfig,
  ActionResult,
} from '#actions';
import type { Delay } from '#delays';
import type {
  AllEvent,
  EventArg,
  EventsMap,
  PromiseeMap,
  ToEvents,
  ToEventsR,
} from '#events';
import type { GuardConfig, PredicateS, PredicateS2 } from '#guards';
import type {
  AnyMachine,
  ChildS,
  ContextFrom,
  PrivateContextFrom,
} from '#machines';
import type {
  PromiseeConfig,
  PromiseeResult,
  PromiseFunction,
  PromiseFunction2,
} from '#promises';
import type {
  ActivityConfig,
  Node,
  NodeConfig,
  StateValue,
} from '#states';
import type {
  AlwaysConfig,
  DelayedTransitions,
  TransitionConfig,
} from '#transitions';
import type { FnR } from '#types';
import type { TimeoutPromise } from '@bemedev/basifun';
import type { Decompose } from '@bemedev/decompose';
import type { Interval2, IntervalParams } from '@bemedev/interval2';
import type { types } from '@bemedev/types';
import { type InterpreterFrom } from './interpreter';
import type { SubscriberClass, SubscriberOptions } from './subscriber';

export type WorkingStatus =
  | 'idle'
  | 'starting'
  | 'started'
  | 'paused'
  | 'working'
  | 'sending'
  | 'stopped'
  | 'busy';

export type Mode = 'normal' | 'strict';

export type InterpreterOptions<
  M extends AnyMachine,
  P extends PrivateContextFrom<M> = PrivateContextFrom<M>,
  C extends ContextFrom<M> = ContextFrom<M>,
> = {
  mode?: Mode;
  exact?: boolean;
} & (types.Equals<P, Partial<P>> extends true
  ? { pContext?: P }
  : { pContext: P }) &
  (types.Equals<C, Partial<C>> extends true
    ? { context?: C }
    : { context: C });

export type InterpretArgs<M extends AnyMachine> =
  types.Equals<
    InterpreterOptions<M>,
    Partial<InterpreterOptions<M>>
  > extends true
    ? [machine: M, config?: InterpreterOptions<M>]
    : [machine: M, config: InterpreterOptions<M>];

export type Interpreter_F = <M extends AnyMachine>(
  ...args: InterpretArgs<M>
) => InterpreterFrom<M>;

export type ToAction_F<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
> = (action?: ActionConfig) => Action2<E, P, Pc, Tc>;

export type PerformActionLater_F<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
> = (action: Action2<E, P, Pc, Tc>) => ActionResult<Pc, Tc>;

export type PerformAction_F<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
> = (action: Action2<E, P, Pc, Tc>) => void;

export type ToPredicate_F<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
> = (predicate?: GuardConfig) => PredicateS2<E, P, Pc, Tc>;

export type PerformPredicate_F<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
> = (predicate: PredicateS2<E, P, Pc, Tc>) => boolean;

export type ToDelay_F<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
> = (delay?: string) => FnR<E, P, Pc, Tc, number> | undefined;

export type PerformDelay_F<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
> = (delay: FnR<E, P, Pc, Tc, number>) => number;

export type PerformPromise_F<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
> = (promise: PromiseFunction2<E, P, Pc, Tc>) => Promise<any>;

export type ExecuteActivities_F = (
  from: string,
  activity: ActivityConfig,
) => string[];

export type PerformAfter_F = (
  from: string,
  after: DelayedTransitions,
) => TimeoutPromise<string | false> | undefined;

export type TransitionAfterResult<
  Pc = any,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
> =
  | {
      result: ActionResult<Pc, Tc>;
      target: string;
    }
  | undefined;

export type PerformAlway_F = (always: AlwaysConfig) => string | false;

export type Collected0<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
> = {
  after?: TimeoutPromise<string | false>;

  promisee?: TimeoutPromise<PromiseeResult<E, P> | undefined>;
  always?: () => string | false;
};

export type ToPromiseSrc_F<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
> = (promise: string) => PromiseFunction2<E, P, Pc, Tc>;

export type PerformPromisee_F<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
> = (
  from: string,
  ...promisees: PromiseeConfig[]
) => TimeoutPromise<PromiseeResult<E, P> | undefined> | undefined;

export type Contexts<
  Pc = any,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
> = {
  pContext?: Pc;
  context?: Tc;
};

export type PerformTransition_F = (
  transition: TransitionConfig,
) => string | false;

export type PerformTransitions_F = (
  ...transitions: TransitionConfig[]
) => string | false;

export type SleepContexts_F = <
  Pc = any,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
>(
  ms?: number,
) => Promise<ActionResult<Pc, Tc>>;

export type _Send_F<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
> = (event: ToEventsR<E, P>) => NodeConfig | undefined;

export type State<
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
  E extends AllEvent = AllEvent,
> = {
  context: Tc;
  status: WorkingStatus;
  value: StateValue;
  event: E;
  tags?: string | readonly string[];
};

export type StateP<
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
  E = any,
> = {
  context: Tc;
  status: WorkingStatus;
  value: StateValue;
  payload: E;
  tags?: string | readonly string[];
};

export type StateExtended<
  Pc = any,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
  E extends AllEvent = AllEvent,
> = {
  pContext: Pc;
} & State<Tc, E>;

export type StatePextended<
  Pc = any,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
  E = any,
> = {
  pContext: Pc;
} & StateP<Tc, E>;

type _FnMapR<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
  R = any,
  TT extends ToEventsR<E, P> = ToEventsR<E, P>,
> = {
  [key in TT['type']]?: (
    state: StateP<Tc, Extract<TT, { type: key }>['payload']>,
  ) => R;
} & {
  else?: (state: State<Tc>) => R;
};

export type FnSubReduced<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
  R = any,
> =
  | ((state: State<Tc, ToEvents<E, P>>) => R)
  | _FnMapR<E, P, Tc, R, ToEventsR<E, P>>;

export type AddSubscriber_F<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
> = (
  subscriber: FnSubReduced<E, P, Tc>,
  options?: SubscriberOptions<Tc>,
) => SubscriberClass<E, P, Tc>;

export type Subscribe_F<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
> = (subscriber: FnSubReduced<E, P, Tc>) => SubscriberClass<E, P, Tc>;

export type Selector_F<T = any> = T extends types.Primitive
  ? undefined
  : <
      D extends Decompose<Required<T>, { start: false; object: 'both' }>,
      K extends Extract<keyof D, string>,
      R = D[K],
    >(
      selector: K,
    ) => R;

export interface AnyInterpreter<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
> {
  mode: Mode;
  event: ToEvents<E, P>;
  eventsMap: EventsMap;
  initialNode: Node<E, P, Pc, Tc>;
  node: Node<E, P, Pc, Tc>;

  makeStrict: () => void;
  status: WorkingStatus;
  initialConfig: NodeConfig;
  initialValue: StateValue;
  config: NodeConfig;
  renew: any;
  value: StateValue;
  context: any;
  start: () => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  _providePrivateContext: (pContext: Pc) => AnyMachine<E, P, Pc, Tc>;
  _ppC: (pContext: Pc) => AnyMachine<E, P, Pc, Tc>;
  _provideContext: (context: Tc) => AnyMachine<E, P, Pc, Tc>;

  subscribe: AddSubscriber_F<E, P, Tc>;

  send: (event: EventArg<E>) => void;
  toActionFn: (action: ActionConfig) => Action<E, P, Pc, Tc> | undefined;
  toPredicateFn: (
    guard: GuardConfig,
  ) => PredicateS<E, P, Pc, Tc> | undefined;
  toPromiseSrcFn: (
    src: string,
  ) => PromiseFunction<E, P, Pc, Tc> | undefined;
  toDelayFn: (delay: string) => Delay<E, P, Pc, Tc> | undefined;
  toMachine: (machine: ActionConfig) => ChildS<E, P, Pc> | undefined;
  id?: string;
}

export type CreateInterval2_F = (
  config: types.NOmit<IntervalParams, 'exact'>,
) => Interval2;

export type Subcription = { unsubscribe: () => void };

export type Observer<T> = {
  next: (value: T) => void;
  error: (err: any) => void;
  complete: () => void;
};

export type TimeOutAction = {
  id: string;
  timer: NodeJS.Timeout;
};

export type DiffNext = {
  sv: StateValue;
  diffEntries: ActionConfig[];
  diffExits: ActionConfig[];
};
