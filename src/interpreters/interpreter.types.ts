import type { TimeoutPromise } from '@bemedev/basifun';
import type { Interval2, IntervalParams } from '@bemedev/interval2';
import type { Fn, NOmit } from '@bemedev/types';
import type {
  Action,
  Action2,
  ActionConfig,
  ActionResult,
} from '~actions';
import type { Delay } from '~delays';
import type {
  EventArg,
  EventsMap,
  PromiseeMap,
  ToEvents,
  ToEventsR,
} from '~events';
import type { GuardConfig, PredicateS, PredicateS2 } from '~guards';
import type { Machine } from '~machine';
import type {
  AnyMachine,
  ChildS,
  Config,
  Decompose2,
  GetEventsFromConfig,
  MachineOptions,
  PromiseFunction2,
  SimpleMachineOptions2,
} from '~machines';
import type {
  PromiseConfig,
  PromiseeResult,
  PromiseFunction,
} from '~promises';
import type {
  ActivityConfig,
  Node,
  NodeConfigWithInitials,
  StateValue,
} from '~states';
import type {
  AlwaysConfig,
  DelayedTransitions,
  TransitionConfig,
} from '~transitions';
import type { FnMapReduced, PrimitiveObject } from '~types';
import type { Interpreter } from './interpreter';
import type { Subscriber } from './subscriber';

export type WorkingStatus =
  | 'idle'
  | 'starting'
  | 'started'
  | 'paused'
  | 'working'
  | 'sending'
  | 'stopped'
  | 'busy';

export type Mode = 'normal' | 'strict' | 'strictest';

export type Interpreter_F = <
  const C extends Config = Config,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  E extends EventsMap = GetEventsFromConfig<C>,
  P extends PromiseeMap = PromiseeMap,
  Mo extends SimpleMachineOptions2 = MachineOptions<C, E, P, Pc, Tc>,
>(
  machine: Machine<C, Pc, Tc, E, P, Mo>,
  config: { pContext: Pc; context: Tc; mode?: Mode },
) => Interpreter<C, Pc, Tc, E, P, Mo>;

export type ToAction_F<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (action?: ActionConfig) => Action2<E, P, Pc, Tc>;

export type PerformAction_F<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (action: Action2<E, P, Pc, Tc>) => ActionResult<Pc, Tc>;

export type ToPredicate_F<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (predicate?: GuardConfig) => PredicateS2<E, P, Pc, Tc>;

export type PerformPredicate_F<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (predicate: PredicateS2<E, P, Pc, Tc>) => boolean;

export type ToDelay_F<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (delay?: string) => Fn<[Pc, Tc, ToEvents<E, P>], number> | undefined;

export type PerformDelay_F<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (delay: Fn<[Pc, Tc, ToEvents<E, P>], number>) => number;

export type PerformPromise_F<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (promise: PromiseFunction2<E, P, Pc, Tc>) => Promise<any>;

export type ExecuteActivities_F = (
  from: string,
  activity: ActivityConfig,
) => string[];

export type PerformAfter_F<
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (
  from: string,
  after: DelayedTransitions,
) =>
  | TimeoutPromise<
      | {
          target?: string;
          result: ActionResult<Pc, Tc>;
        }
      | undefined
    >
  | undefined;

export type TransitionAfterResult<
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> =
  | {
      result: ActionResult<Pc, Tc>;
      target: string;
    }
  | undefined;

export type PerformAlway_F<
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (always: AlwaysConfig) => TransitionAfterResult<Pc, Tc>;

export type Collected0<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = {
  after?:
    | TimeoutPromise<
        | {
            target?: string;
            result: ActionResult<Pc, Tc>;
          }
        | undefined
      >
    | undefined;
  promisee?: TimeoutPromise<PromiseeResult<E, P, Pc, Tc> | undefined>;
  always?: TransitionAfterResult<Pc, Tc>;
};

export type ToPromiseSrc_F<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (promise: string) => PromiseFunction2<E, P, Pc, Tc>;

export type PerformPromisee_F<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (
  from: string,
  ...promisees: PromiseConfig[]
) => TimeoutPromise<PromiseeResult<E, P, Pc, Tc> | undefined> | undefined;

export type Contexts<
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = {
  pContext?: Pc;
  context?: Tc;
};

export type PerformTransition_F<
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (transition: TransitionConfig) =>
  | {
      target?: string;
      result: ActionResult<Pc, Tc>;
    }
  | string
  | false;

export type PerformTransitions_F<
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (...transitions: TransitionConfig[]) => {
  target?: string;
  result?: ActionResult<Pc, Tc>;
};

export type SleepContexts_F = <
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
>(
  ms?: number,
) => Promise<ActionResult<Pc, Tc>>;

export type _Send_F<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (event: ToEventsR<E, P>) => {
  result: ActionResult<Pc, Tc>;
  next?: NodeConfigWithInitials;
};

export type AddSubscriber_F<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (subscriber: FnMapReduced<E, P, Tc>) => Subscriber<E, P, Tc>;

export type Subscribe_F<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (subscriber: FnMapReduced<E, P, Tc>) => Subscriber<E, P, Tc>;

export type Selector_F<T = any> = <
  D extends Decompose2<T>,
  K extends Extract<keyof D, string>,
  R = D[K],
>(
  selctor: K,
) => R;

export interface AnyInterpreter<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> {
  mode: Mode;
  event: ToEvents<E, P>;
  eventsMap: EventsMap;
  initialNode: Node<E, P, Pc, Tc>;
  node: Node<E, P, Pc, Tc>;

  makeStrict: () => void;
  makeStrictest: () => void;
  status: WorkingStatus;
  initialConfig: NodeConfigWithInitials;
  initialValue: StateValue;
  config: NodeConfigWithInitials;
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

  subscribeWeak: AddSubscriber_F<E, P, Tc>;

  send: (event: EventArg<E, P>) => void;
  flushSubscribers: () => void;
  toAction: (action: ActionConfig) => Action<E, P, Pc, Tc> | undefined;
  toPredicate: (
    guard: GuardConfig,
  ) => PredicateS<E, P, Pc, Tc> | undefined;
  toPromiseSrc: (src: string) => PromiseFunction<E, P, Pc, Tc> | undefined;
  toDelay: (delay: string) => Delay<E, P, Pc, Tc> | undefined;
  toMachine: (machine: ActionConfig) => ChildS<E, P, Tc> | undefined;
  id?: string;
}

export type CreateInterval2_F = (
  config: NOmit<IntervalParams, 'exact'>,
) => Interval2;
