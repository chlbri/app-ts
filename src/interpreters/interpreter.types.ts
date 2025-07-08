import type { TimeoutPromise } from '@bemedev/basifun';
import type { Interval2, IntervalParams } from '@bemedev/interval2';
import type {
  Fn,
  NOmit,
  PrimitiveObject,
} from '@bemedev/types/lib/types/types';
import type {
  Action,
  Action2,
  ActionConfig,
  ActionResult,
} from '~actions';
import type { Delay } from '~delays';
import type {
  EventArg,
  EventObject,
  EventsMap,
  EventStrings,
  PromiseeMap,
  ToEvents,
  ToEventsR,
} from '~events';
import type { GuardConfig, PredicateS, PredicateS2 } from '~guards';
import type {
  AnyMachine,
  ChildS,
  ContextFrom,
  Decompose2,
  PrivateContextFrom,
} from '~machines';
import type {
  PromiseeConfig,
  PromiseeResult,
  PromiseFunction,
  PromiseFunction2,
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
import type { InterpreterFrom } from './interpreter';
import type { SubscriberOptions } from './subscriber';
import type { SubscriberMapClass } from './subscriberMap';

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

export type InterpreterOptions<M extends AnyMachine> = {
  pContext: PrivateContextFrom<M>;
  context: ContextFrom<M>;
  mode?: Mode;
  exact?: boolean;
};

export type Interpreter_F = <M extends AnyMachine>(
  machine: M,
  config: InterpreterOptions<M>,
) => InterpreterFrom<M>;

export type ToAction_F<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc extends PrimitiveObject = PrimitiveObject,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (action?: ActionConfig) => Action2<E, P, Pc, Tc>;

export type PerformAction_F<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc extends PrimitiveObject = PrimitiveObject,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (action: Action2<E, P, Pc, Tc>) => ActionResult<Pc, Tc>;

export type ToPredicate_F<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc extends PrimitiveObject = PrimitiveObject,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (predicate?: GuardConfig) => PredicateS2<E, P, Pc, Tc>;

export type PerformPredicate_F<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc extends PrimitiveObject = PrimitiveObject,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (predicate: PredicateS2<E, P, Pc, Tc>) => boolean;

export type ToDelay_F<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc extends PrimitiveObject = PrimitiveObject,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (delay?: string) => Fn<[Pc, Tc, ToEvents<E, P>], number> | undefined;

export type PerformDelay_F<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc extends PrimitiveObject = PrimitiveObject,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (delay: Fn<[Pc, Tc, ToEvents<E, P>], number>) => number;

export type PerformPromise_F<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc extends PrimitiveObject = PrimitiveObject,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (promise: PromiseFunction2<E, P, Pc, Tc>) => Promise<any>;

export type ExecuteActivities_F = (
  from: string,
  activity: ActivityConfig,
) => string[];

export type PerformAfter_F<
  Pc extends PrimitiveObject = PrimitiveObject,
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
  Pc extends PrimitiveObject = PrimitiveObject,
  Tc extends PrimitiveObject = PrimitiveObject,
> =
  | {
      result: ActionResult<Pc, Tc>;
      target: string;
    }
  | undefined;

export type PerformAlway_F<
  Pc extends PrimitiveObject = PrimitiveObject,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (always: AlwaysConfig) => TransitionAfterResult<Pc, Tc>;

export type Collected0<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc extends PrimitiveObject = PrimitiveObject,
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
  Pc extends PrimitiveObject = PrimitiveObject,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (promise: string) => PromiseFunction2<E, P, Pc, Tc>;

export type PerformPromisee_F<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc extends PrimitiveObject = PrimitiveObject,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (
  from: string,
  ...promisees: PromiseeConfig[]
) => TimeoutPromise<PromiseeResult<E, P, Pc, Tc> | undefined> | undefined;

export type Contexts<
  Pc extends PrimitiveObject = PrimitiveObject,
  Tc extends PrimitiveObject = PrimitiveObject,
> = {
  pContext?: Pc;
  context?: Tc;
};

export type PerformTransition_F<
  Pc extends PrimitiveObject = PrimitiveObject,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (transition: TransitionConfig) =>
  | {
      target?: string;
      result: ActionResult<Pc, Tc>;
    }
  | string
  | false;

export type PerformTransitions_F<
  Pc extends PrimitiveObject = PrimitiveObject,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (...transitions: TransitionConfig[]) => {
  target?: string;
  result?: ActionResult<Pc, Tc>;
};

export type SleepContexts_F = <
  Pc extends PrimitiveObject = PrimitiveObject,
  Tc extends PrimitiveObject = PrimitiveObject,
>(
  ms?: number,
) => Promise<ActionResult<Pc, Tc>>;

export type _Send_F<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc extends PrimitiveObject = PrimitiveObject,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (event: ToEventsR<E, P>) => {
  result: ActionResult<Pc, Tc>;
  next?: NodeConfigWithInitials;
};

export type StateR<
  Tc extends PrimitiveObject = PrimitiveObject,
  P = any,
> = {
  context: Tc;
  status: WorkingStatus;
  value: StateValue;
  event: P;
  tags?: string | readonly string[];
};

type _FnMapR<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Tc extends PrimitiveObject = PrimitiveObject,
  R = any,
  TT extends ToEventsR<E, P> = ToEventsR<E, P>,
> = {
  [key in TT['type']]?: (
    state: StateR<Tc, Extract<TT, { type: key }>>,
  ) => R;
} & {
  else?: (state: State<Tc>) => R;
};

export type FnSubReduced<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Tc extends PrimitiveObject = PrimitiveObject,
  R = any,
> = ((state: State<Tc>) => R) | _FnMapR<E, P, Tc, R, ToEventsR<E, P>>;

export type AddSubscriber_F<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (
  subscriber: FnSubReduced<E, P, Tc>,
  options?: SubscriberOptions<Tc>,
) => SubscriberMapClass<E, P, Tc>;

export type Subscribe_F<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (subscriber: FnSubReduced<E, P, Tc>) => SubscriberMapClass<E, P, Tc>;

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
  Pc extends PrimitiveObject = PrimitiveObject,
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

  subscribeMap: AddSubscriber_F<E, P, Tc>;

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
  config: NOmit<IntervalParams, 'exact'>,
) => Interval2;

export type State<Tc extends PrimitiveObject> = StateR<
  Tc,
  EventObject | EventStrings
>;

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
