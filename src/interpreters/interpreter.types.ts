import type {
  Equals,
  NOmit,
  NotUndefined,
  Primitive,
  PrimitiveObject,
} from '#bemedev/globals/types';
import type { DelayFunction2, DelayFunction3 } from '#delays';
import type {
  ActorsConfigMap,
  EventArg,
  EventObject,
  EventsMap,
  ToEventObject,
  ToEvents,
} from '#events';
import type { GuardConfig, PredicateS2, PredicateS3 } from '#guards';
import type { ContextFrom, PrivateContextFrom } from '#machines';
import type { PromiseeResult, PromiseFunction2 } from '#promises';
import type { ActivityConfig, NodeConfig, StateValue } from '#states';
import type {
  AlwaysConfig,
  DelayedTransitions,
  TransitionConfig,
} from '#transitions';
import type { TimeoutPromise } from '@bemedev/basifun';
import type { Decompose } from '@bemedev/decompose';
import type { Interval2, IntervalParams } from '@bemedev/interval2';
import type { Pausable } from '@bemedev/rx-pausable';
import { Observable } from 'rxjs';
import type { Action2, ActionConfig, ActionResult } from '#actions';
import type { EmitterConfig, PromiseeConfig } from '../actor.types';
import type { AnyMachine } from '#machines';
import type { FnMapR, OptionalDefinition } from '~types';
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
  E extends EventObject = EventObject,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
> = (action?: ActionConfig) => Action2<E, Pc, Tc, T>;

export type PerformActionLater_F<
  E extends EventObject = EventObject,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
> = (action: Action2<E, Pc, Tc, T>) => ActionResult<Pc, Tc>;

export type PerformAction_F<
  E extends EventObject = EventObject,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
> = (action: Action2<E, Pc, Tc, T>) => void;

export type ToPredicate_F<
  E extends EventObject = EventObject,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
> = (predicate?: GuardConfig) => PredicateS2<E, Pc, Tc, T>;

export type PerformPredicate_F<
  E extends EventObject = EventObject,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
> = (predicate: PredicateS3<E, Pc, Tc, T>) => boolean;

export type ToDelay_F<
  E extends EventObject = EventObject,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
> = (delay?: string) => DelayFunction2<E, Pc, Tc, T> | undefined;

export type PerformDelay_F<
  E extends EventObject = EventObject,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
> = (delay: DelayFunction3<E, Pc, Tc, T>) => number;

export type PerformPromise_F<
  E extends EventObject = EventObject,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
> = (promise: PromiseFunction2<E, Pc, Tc, T>) => Promise<any>;

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

export type Collected0<E extends EventObject> = {
  after?: TimeoutPromise<string | false>;
  promisee?: () => Promise<(PromiseeResult<E> | undefined)[]>;
  always?: () => string | false;
};

export type ToPromiseSrc_F<
  E extends EventObject = EventObject,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
> = (promise: string) => PromiseFunction2<E, Pc, Tc, T>;

export type PerformPromisee_F<E extends EventObject> = (
  from: string,
  ...promisees: (PromiseeConfig & { id: string })[]
) => (() => Promise<(PromiseeResult<E> | undefined)[]>) | undefined;

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

export type _Send_F<E extends EventObject> = (
  event: E,
) => NodeConfig | undefined;

export type AddSubscriber_F<
  E extends EventsMap = EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
  Eo extends ToEventObject<ToEvents<E, A>> = ToEventObject<ToEvents<E, A>>,
> = (
  subscriber: FnMapR<Eo, Tc, T, void>,
  options?: SubscriberOptions<Eo, Tc, T>,
) => SubscriberClass<E, A, Tc, T, Eo>;

export type Subscribe_F<
  E extends EventsMap = EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
  Eo extends ToEventObject<ToEvents<E, A>> = ToEventObject<ToEvents<E, A>>,
> = (
  subscriber: FnMapR<Eo, Tc, T, void>,
  options?: SubscriberOptions<Eo, Tc, T>,
) => SubscriberClass<E, A, Tc, T, Eo>;

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
  T extends string = string,
> {
  mode: Mode;
  eventsMap: EventsMap;
  initialNode: any;
  node: any;

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

  subscribe: AddSubscriber_F<E, A, Tc, T>;

  send: (event: EventArg<E>) => void;
  toActionFn: (action: ActionConfig) => any;
  toPredicateFn: (guard: GuardConfig) => any;
  toPromiseSrcFn: (src: string) => any;
  toDelayFn: (delay: string) => any;
  toChildFunction: (machine: string) => any;
  toObservable: (emitter: string) => any;
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

export type CollectedPausable = {
  from: string;
  pausable: Pausable;
  id: string;
};

export type CollectedService = {
  from: string;
  service: AnyInterpreter;
  id: string;
};
