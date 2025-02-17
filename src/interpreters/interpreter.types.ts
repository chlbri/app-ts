import type { Fn } from '@bemedev/types';
import type {
  Action,
  Action2,
  ActionConfig,
  ActionResult,
} from '~actions';
import type { Delay } from '~delays';
import type { EventArg, EventsMap, ToEvents } from '~events';
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
  TimeoutPromise,
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
  Mo extends SimpleMachineOptions2 = MachineOptions<C, E, Pc, Tc>,
>(
  machine: Machine<C, Pc, Tc, E, Mo>,
  config: { pContext: Pc; context: Tc; mode?: Mode },
) => Interpreter<C, Pc, Tc, E, Mo>;

export type ToAction_F<
  E extends EventsMap = EventsMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (action?: ActionConfig) => Action2<E, Pc, Tc>;

export type PerformAction_F<
  E extends EventsMap = EventsMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (action: Action2<E, Pc, Tc>) => ActionResult<Pc, Tc>;

export type ToPredicate_F<
  E extends EventsMap = EventsMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (predicate?: GuardConfig) => PredicateS2<E, Pc, Tc>;

export type PerformPredicate_F<
  E extends EventsMap = EventsMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (predicate: PredicateS2<E, Pc, Tc>) => boolean;

export type ToDelay_F<
  E extends EventsMap = EventsMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (delay?: string) => Fn<[Pc, Tc, ToEvents<E>], number> | undefined;

export type PerformDelay_F<
  E extends EventsMap = EventsMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (delay: Fn<[Pc, Tc, ToEvents<E>], number>) => number;

export type PerformPromise_F<
  E extends EventsMap = EventsMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (promise: PromiseFunction2<E, Pc, Tc>) => Promise<any>;

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
  | {
      promise: TimeoutPromise<
        | {
            target?: string;
            result: ActionResult<Pc, Tc>;
          }
        | undefined
      >;
      finalize: () => void;
    }
  | undefined;

export type PerformAlway_F<
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (
  from: string,
  always: AlwaysConfig,
) =>
  | {
      result: ActionResult<Pc, Tc>;
      target: string;
    }
  | undefined;

export type ToPromiseSrc_F<
  E extends EventsMap = EventsMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (promise: string) => PromiseFunction2<E, Pc, Tc>;

export type PerformPromisees_F<
  E extends EventsMap = EventsMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (
  from: string,
  ...promisees: PromiseConfig[]
) =>
  | {
      finalize: () => void;
      promise: TimeoutPromise<PromiseeResult<E, Pc, Tc> | undefined>;
    }
  | undefined;

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

export type Remaininigs<
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (() => { target?: string; result: ActionResult<Pc, Tc> })[];

export type _Send_F<
  E extends EventsMap = EventsMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (event: Exclude<ToEvents<E>, string>) =>
  | {
      result: ActionResult<Pc, Tc>;
      next: NodeConfigWithInitials;
    }
  | undefined;

export type AddSubscriber_F<
  E extends EventsMap = EventsMap,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (subscriber: FnMapReduced<E, Tc>) => Subscriber<E, Tc>;

export type Selector_F<T = any> = <
  D extends Decompose2<T>,
  K extends Extract<keyof D, string>,
  R = D[K],
>(
  selctor: K,
) => R;

export interface AnyInterpreter<
  E extends EventsMap = EventsMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> {
  mo: any;
  mode: Mode;
  event: ToEvents<E>;
  eventsMap: EventsMap;
  initialNode: Node<E, Pc, Tc>;
  node: Node<E, Pc, Tc>;

  makeStrict: () => void;
  makeStrictest: () => void;
  status: WorkingStatus;
  initialConfig: NodeConfigWithInitials;
  initialValue: StateValue;
  config: NodeConfigWithInitials;
  renew: Interpreter<any, any, any, any, any>;
  value: StateValue;
  context: any;
  start: () => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  providePrivateContext: (pContext: Pc) => AnyMachine<E, Pc, Tc>;
  ppC: (pContext: Pc) => AnyMachine<E, Pc, Tc>;
  provideContext: (context: Tc) => AnyMachine<E, Pc, Tc>;
  addAction: Fn;
  addGuard: Fn;
  addPromise: Fn;
  addDelay: Fn;
  addMachine: Fn;
  addSubscriber: AddSubscriber_F<any, any>;
  errorsCollector: Set<string>;
  warningsCollector: Set<string>;
  send: (event: EventArg<E>) => Promise<void>;
  canEvent: (eventS: string) => boolean;
  possibleEvents: string[];
  flushSubscribers: () => void;
  toAction: (action: ActionConfig) => Action<E, Pc, Tc> | undefined;
  toPredicate: (guard: GuardConfig) => PredicateS<E, Pc, Tc> | undefined;
  toPromiseSrc: (src: string) => PromiseFunction<E, Pc, Tc> | undefined;
  toDelay: (delay?: string) => Delay<E, Pc, Tc> | undefined;
  toMachine: (machine: ActionConfig) => ChildS<E, Tc> | undefined;
  id?: string;
}
