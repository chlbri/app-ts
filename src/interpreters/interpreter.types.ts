import type { Fn } from '@bemedev/types';
import type { Action2, ActionConfig, ActionResult } from '~actions';
import type { EventsMap, ToEvents } from '~events';
import type { GuardConfig, PredicateS2 } from '~guards';
import type { Machine } from '~machine';
import type {
  Config,
  MachineOptions,
  PromiseFunction2,
  SimpleMachineOptions2,
} from '~machines';
import type {
  PromiseConfig,
  PromiseeResult,
  TimeoutPromise,
} from '~promises';
import type { ActivityConfig, NodeConfigWithInitials } from '~states';
import type {
  AlwaysConfig,
  DelayedTransitions,
  TransitionConfig,
} from '~transitions';
import type { FnMap, PrimitiveObject } from '~types';
import type { Interpreter } from './interpreter';

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
  E extends EventsMap = EventsMap,
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
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (...subscribers: FnMap<E, Pc, Tc>[]) => void;
