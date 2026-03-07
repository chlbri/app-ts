import type { ChildConfig, EmitterConfig, PromiseeConfig } from '#actor';
import type {
  Equals,
  NOmit,
  NotUndefined,
  Primitive,
  PrimitiveObject,
} from '#bemedev/globals/types';
import type {
  ActorsConfigMap,
  EventArg,
  EventsMap,
  ToEvents2,
  ToEventsR2,
} from '#events';
import type {
  ActivityConfig,
  Node,
  NodeConfig,
  State,
  StateP,
  StateValue,
} from '#states';
import type {
  AlwaysConfig,
  DelayedTransitions,
  TransitionConfig,
} from '#transitions';
import type { TimeoutPromise } from '@bemedev/basifun';
import type { Decompose } from '@bemedev/decompose';
import type { Interval2, IntervalParams } from '@bemedev/interval2';
import type { Pausable } from '@bemedev/rx-pausable';
import type {
  Action,
  Action2,
  ActionConfig,
  ActionResult,
} from 'src/actions/types';
import type { DelayFunction } from 'src/delays/types';
import type {
  GuardConfig,
  PredicateS,
  PredicateS2,
} from 'src/guards/types';
import type { AnyMachine } from 'src/machine/machine.types';
import type {
  Config,
  ContextFrom,
  PrivateContextFrom,
} from 'src/machine/types';
import type {
  PromiseeResult,
  PromiseFunction,
  PromiseFunction2,
} from '#promises';
import type { FnR, OptionalDefinition } from '~types';
import { type InterpreterFrom } from './interpreter';
import type { SubscriberClass, SubscriberOptions } from './subscriber';
import { Observable } from 'rxjs';

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

export type OptionalDefinitions<P, C> = OptionalDefinition<P, 'pContext'> &
  OptionalDefinition<C, 'context'>;

export type InterpreterOptions<
  M extends AnyMachine,
  P extends PrivateContextFrom<M> = PrivateContextFrom<M>,
  C extends ContextFrom<M> = ContextFrom<M>,
> = {
  mode?: Mode;
  exact?: boolean;
} & OptionalDefinitions<P, C>;

export type InterpretArgs<M extends AnyMachine> =
  Equals<
    InterpreterOptions<M>,
    Partial<InterpreterOptions<M>>
  > extends true
    ? [machine: M, config?: InterpreterOptions<M>]
    : [machine: M, config: InterpreterOptions<M>];

export type Interpreter_F = <M extends AnyMachine>(
  ...args: InterpretArgs<M>
) => InterpreterFrom<M>;

export type ToAction_F<
  C extends Config = Config,
  E extends EventsMap = EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (action?: ActionConfig) => Action2<C, E, A, Pc, Tc>;

export type PerformActionLater_F<
  C extends Config = Config,
  E extends EventsMap = EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (action: Action2<C, E, A, Pc, Tc>) => ActionResult<Pc, Tc>;

export type PerformAction_F<
  C extends Config = Config,
  E extends EventsMap = EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (action: Action2<C, E, A, Pc, Tc>) => void;

export type ToPredicate_F<
  C extends Config = Config,
  E extends EventsMap = EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (predicate?: GuardConfig) => PredicateS2<C, E, A, Pc, Tc>;

export type PerformPredicate_F<
  C extends Config = Config,
  E extends EventsMap = EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (predicate: PredicateS2<C, E, A, Pc, Tc>) => boolean;

export type ToDelay_F<
  C extends Config = Config,
  E extends EventsMap = EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (delay?: string) => FnR<C, E, A, Pc, Tc, number> | undefined;

export type PerformDelay_F<
  C extends Config = Config,
  E extends EventsMap = EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (delay: FnR<C, E, A, Pc, Tc, number>) => number;

export type PerformPromise_F<
  C extends Config = Config,
  E extends EventsMap = EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (promise: PromiseFunction2<C, E, A, Pc, Tc>) => Promise<any>;

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
  Tc extends PrimitiveObject = PrimitiveObject,
> =
  | {
      result: ActionResult<Pc, Tc>;
      target: string;
    }
  | undefined;

export type PerformAlway_F = (always: AlwaysConfig) => string | false;

export type Collected0<
  E extends EventsMap = EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
> = {
  after?: TimeoutPromise<string | false>;
  promisee?: () => Promise<(PromiseeResult<E, A> | undefined)[]>;
  always?: () => string | false;
};

export type ToPromiseSrc_F<
  C extends Config = Config,
  E extends EventsMap = EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (promise: string) => PromiseFunction2<C, E, A, Pc, Tc>;

export type PerformPromisee_F<
  E extends EventsMap = EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
> = (
  from: string,
  ...promisees: PromiseeConfig[]
) => (() => Promise<(PromiseeResult<E, A> | undefined)[]>) | undefined;

export type Contexts<
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
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
  Tc extends PrimitiveObject = PrimitiveObject,
>(
  ms?: number,
) => Promise<ActionResult<Pc, Tc>>;

export type _Send_F<
  E extends EventsMap = EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
> = (event: ToEventsR2<E, A>) => NodeConfig | undefined;

type _FnMapR<
  C extends Config = Config,
  E extends EventsMap = EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Tc extends PrimitiveObject = PrimitiveObject,
  R = any,
  TT extends ToEventsR2<E, A> = ToEventsR2<E, A>,
> = {
  [key in TT['type']]?: (
    state: StateP<C, Tc, Extract<TT, { type: key }>['payload']>,
  ) => R;
} & {
  else?: (state: State<C, Tc, ToEvents2<E, A>>) => R;
};

export type FnSubReduced<
  C extends Config = Config,
  E extends EventsMap = EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Tc extends PrimitiveObject = PrimitiveObject,
  R = any,
> =
  | ((state: State<C, Tc, ToEvents2<E, A>>) => R)
  | _FnMapR<C, E, A, Tc, R, ToEventsR2<E, A>>;

export type AddSubscriber_F<
  C extends Config = Config,
  E extends EventsMap = EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (
  subscriber: FnSubReduced<C, E, A, Tc>,
  options?: SubscriberOptions<C, Tc>,
) => SubscriberClass<C, E, A, Tc>;

export type Subscribe_F<
  C extends Config = Config,
  E extends EventsMap = EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (
  subscriber: FnSubReduced<C, E, A, Tc>,
) => SubscriberClass<C, E, A, Tc>;

export type Selector_F<T = any> = T extends Primitive
  ? undefined
  : <
      D extends Decompose<
        Required<NotUndefined<T>>,
        { start: false; object: 'both' }
      >,
      K extends Extract<keyof D, string>,
      R = D[K],
    >(
      selector: K,
    ) => R;

export interface AnyInterpreter<
  E extends EventsMap = EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> {
  mode: Mode;
  event: ToEvents2<E, A>;
  eventsMap: EventsMap;
  initialNode: Node<Config, E, A, Pc, Tc>;
  node: Node<Config, E, A, Pc, Tc>;

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
  _providePrivateContext: (pContext: Pc) => AnyMachine<E, A, Pc, Tc>;
  _ppC: (pContext: Pc) => AnyMachine<E, A, Pc, Tc>;
  _provideContext: (context: Tc) => AnyMachine<E, A, Pc, Tc>;

  subscribe: AddSubscriber_F<Config, E, A, Tc>;

  send: (event: EventArg<E>) => void;
  toActionFn: (
    action: ActionConfig,
  ) => Action<Config, E, A, Pc, Tc> | undefined;
  toPredicateFn: (
    guard: GuardConfig,
  ) => PredicateS<Config, E, A, Pc, Tc> | undefined;
  toPromiseSrcFn: (
    src: string,
  ) => PromiseFunction<Config, E, A, Pc, Tc> | undefined;
  toDelayFn: (
    delay: string,
  ) => DelayFunction<Config, E, A, Pc, Tc> | undefined;
  toChild: (machine: string) => AnyInterpreter | undefined;
  toObservable: (emitter: string) => Observable<unknown> | undefined;
  id?: string;
  from?: string;

  dispose: () => void;
}

export type CreateInterval2_F = (
  config: NOmit<IntervalParams, 'exact'>,
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

export type CollectedObservable = EmitterConfig & {
  from: string;
  observable: Observable<any>;
};

export type CollectedEmitter = Pick<EmitterConfig, 'id'> & {
  from: string;
  emitter: Pausable;
};

export type CollectedService = NOmit<ChildConfig, 'src'> & {
  from: string;
  service: AnyInterpreter;
};
