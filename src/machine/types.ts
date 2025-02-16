import type { Decompose } from '@bemedev/decompose';
import type {
  DeepNotUndefined,
  DeepPartial,
  Fn,
  NotUndefined,
  Primitive,
  Ru,
} from '@bemedev/types';
import type { Action, ActionConfig, FromActionConfig } from '~actions';
import type { Delay } from '~delays';
import type { EventsMap, ToEvents } from '~events';
import type { PredicateS } from '~guards';
import type { AnyMachine } from '~machine';
import type {
  ActivityConfig,
  ExtractActionsFromActivity,
  ExtractDelaysFromActivity,
  ExtractGuardsFromActivity,
  FlatMapN,
  NodeConfigCompound,
  NodeConfigCompoundWithInitials,
  NodeConfigParallel,
  NodeConfigParallelWithInitials,
  NodesConfig,
} from '~states';
import type {
  ExtractActionsFromTransitions,
  ExtractDelaysFromTransitions,
  ExtractGuardsFromTransitions,
  ExtractSrcFromTransitions,
  TransitionsConfig,
} from '~transitions';
import type {
  ConcatFnMap,
  Describer,
  FnMap,
  FnMap2,
  KeyU,
  PrimitiveObject,
  PrimitiveObjectMap,
  RecordS,
  ReduceArray,
  SingleOrArrayL,
  SingleOrArrayR,
  SubType,
} from '~types';

export type ConfigNode = NodeConfigCompound | NodeConfigParallel;

export type ConfigNodeWithInitials =
  | NodeConfigCompoundWithInitials
  | NodeConfigParallelWithInitials;

export type MachineConfig = (Describer & { id?: string }) | string;

export type Config = ConfigNode & {
  readonly machines?: SingleOrArrayL<MachineConfig>;
  readonly strict?: boolean;
};

export type ConfigWithInitials = ConfigNodeWithInitials & {
  machines?: SingleOrArrayR<ActionConfig>;
  strict?: boolean;
};

export type GetInititalsFromFlat<Flat extends FlatMapN = FlatMapN> =
  SubType<
    Flat,
    { type?: 'compound'; states: NodesConfig }
  > extends infer Sub
    ? {
        [key in keyof Sub]: keyof ('states' extends keyof Sub[key]
          ? Sub[key]['states']
          : never);
      }
    : never;

type _GetKeyActionsFromFlat<Flat extends FlatMapN> = {
  [key in keyof Flat]:
    | ExtractActionsFromTransitions<Extract<Flat[key], TransitionsConfig>>
    | ExtractActionsFromActivity<
        Extract<Flat[key], { activities: ActivityConfig }>
      >
    | FromActionConfig<
        ReduceArray<Extract<Flat[key], { entry: any }>['entry']>
      >
    | FromActionConfig<
        ReduceArray<Extract<Flat[key], { exit: any }>['exit']>
      > extends infer V
    ? unknown extends V
      ? never
      : V
    : never;
}[keyof Flat];

type _GetKeyGuardsFromFlat<Flat extends FlatMapN> = {
  [key in keyof Flat]:
    | ExtractGuardsFromTransitions<Extract<Flat[key], TransitionsConfig>>
    | ExtractGuardsFromActivity<
        Extract<Flat[key], { activities: ActivityConfig }>
      > extends infer V
    ? unknown extends V
      ? never
      : V
    : never;
}[keyof Flat];

type _GetKeySrcFromFlat<Flat extends FlatMapN> = {
  [key in keyof Flat]: ExtractSrcFromTransitions<
    Extract<Flat[key], TransitionsConfig>
  > extends infer V
    ? unknown extends V
      ? never
      : V
    : never;
}[keyof Flat];

type _GetEventsFromFlat<Flat extends FlatMapN> = {
  [key in keyof Flat]: Flat[key] extends { on: infer V } ? keyof V : never;
}[keyof Flat];

type _GetKeyDelaysFromFlat<Flat extends FlatMapN> = {
  [key in keyof Flat]:
    | ExtractDelaysFromTransitions<Extract<Flat[key], TransitionsConfig>>
    | ExtractDelaysFromActivity<Flat[key]> extends infer V
    ? unknown extends V
      ? never
      : V
    : never;
}[keyof Flat];

export type GetActionsFromFlat<
  Flat extends FlatMapN,
  E extends EventsMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = Record<_GetKeyActionsFromFlat<Flat>, Action<E, Pc, Tc>>;

export type GetGuardsFromFlat<
  Flat extends FlatMapN,
  E extends EventsMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = Record<_GetKeyGuardsFromFlat<Flat>, PredicateS<E, Pc, Tc>>;

export type GetSrcFromFlat<
  Flat extends FlatMapN,
  E extends EventsMap = EventsMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = Record<_GetKeySrcFromFlat<Flat>, PromiseFunction<E, Pc, Tc>>;

export type GetDelaysFromFlat<
  Flat extends FlatMapN,
  E extends EventsMap = EventsMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = Record<_GetKeyDelaysFromFlat<Flat>, Delay<E, Pc, Tc>>;

export type GetEventsFromFlat<Flat extends FlatMapN> = Record<
  _GetEventsFromFlat<Flat>,
  PrimitiveObject
>;

export type GetEventsFromConfig<C extends Config> = GetEventsFromFlat<
  FlatMapN<C>
>;

export type GetEventsFromMachine<T extends KeyU<'preConfig'>> =
  GetEventsFromConfig<ConfigFrom<T>>;

export type GetMachineKeysFromConfig<C extends Config> = FromActionConfig<
  ReduceArray<NotUndefined<C['machines']>>
>;

type _KeysMatchingContext<T extends PrimitiveObjectMap> = T extends object
  ? Decompose<T>
  : T;

export type KeysMatchingContext<T extends PrimitiveObjectMap> = Extract<
  _KeysMatchingContext<T>,
  string | number
>;

export type Decompose2<T extends Ru> = Decompose<DeepNotUndefined<T>>;

type HeritageMap<U extends Ru, Tc extends Ru> =
  Decompose2<U> extends infer KU extends object
    ? {
        [key in keyof KU]?: Decompose2<Tc> extends infer KT extends object
          ? SingleOrArrayL<keyof SubType<KT, KU[key]>>
          : never;
      }
    : never;

export type Subscriber<
  E extends EventsMap = EventsMap,
  Tc extends PrimitiveObject = PrimitiveObject,
  U extends KeyU<'preConfig' | 'context'> = KeyU<'preConfig' | 'context'>,
> = {
  events:
    | SingleOrArrayL<{
        [key in keyof GetEventsFromMachine<U>]?: SingleOrArrayL<keyof E>;
      }>
    | 'allEvents'
    | 'full';
  contexts: ContextFrom<U> extends infer CU
    ? CU extends Ru
      ? Tc extends Ru
        ? SingleOrArrayL<HeritageMap<CU, Tc>>
        : never
      : CU extends Primitive
        ? Tc extends CU
          ? true
          : Tc extends infer Tc1 extends Ru
            ? SingleOrArrayL<keyof SubType<Decompose<Tc1>, CU>>
            : never
        : never
    : never;
};

export type ChildS<
  E extends EventsMap = EventsMap,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends KeyU<'preConfig' | 'context' | 'pContext'> = KeyU<
    'preConfig' | 'context' | 'pContext'
  >,
> = {
  machine: T;
  initials: {
    pContext: PrivateContextFrom<T>;
    context: ContextFrom<T>;
  };
  subscribers: SingleOrArrayL<Subscriber<E, Tc, NoInfer<T>>>;
};

export type Subscriber2<
  E extends EventsMap = EventsMap,
  Tc extends PrimitiveObject = PrimitiveObject,
  U extends KeyU<'eventsMap' | 'pContext' | 'context'> = KeyU<
    'eventsMap' | 'pContext' | 'context'
  >,
> =
  | ConcatFnMap<FnMap2<E, Tc, DeepPartial<Tc>>, FnMapFrom2<U>>
  | ConcatFnMap<FnMap2<E, Tc, DeepPartial<Tc>>, FnMapFrom2<U>>['else'];

export type Child<
  E extends EventsMap = EventsMap,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends AnyMachine = AnyMachine,
> = {
  machine: T;
  initials: {
    pContext: PrivateContextFrom<T>;
    context: ContextFrom<T>;
  };
  subscriber: Subscriber2<E, Tc, T>;
};

export type FnMapFrom<
  T extends KeyU<'eventsMap' | 'pContext' | 'context'>,
  R = any,
> = FnMap<
  Extract<EventsMapFrom<T>, EventsMap>,
  PrivateContextFrom<T>,
  Extract<ContextFrom<T>, PrimitiveObject>,
  R
>;

export type FnMapFrom2<
  T extends KeyU<'eventsMap' | 'pContext' | 'context'>,
  R = any,
> = FnMap2<
  Extract<EventsMapFrom<T>, EventsMap>,
  Extract<ContextFrom<T>, PrimitiveObject>,
  R
>;

export type GetMachinesFromConfig<
  C extends Config,
  E extends EventsMap = EventsMap,
  Tc extends PrimitiveObject = PrimitiveObject,
> = Record<GetMachineKeysFromConfig<C>, ChildS<E, Tc>>;

export type MachineOptions<
  C extends Config = Config,
  E extends EventsMap = EventsMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  Flat extends FlatMapN<C> = FlatMapN<C>,
> = {
  initials: GetInititalsFromFlat<Flat>;
  actions?: Partial<GetActionsFromFlat<Flat, E, Pc, Tc>>;
  predicates?: Partial<GetGuardsFromFlat<Flat, E, Pc, Tc>>;
  promises?: Partial<GetSrcFromFlat<Flat, E, Pc, Tc>>;
  delays?: Partial<GetDelaysFromFlat<Flat, E, Pc, Tc>>;
  machines?: Partial<GetMachinesFromConfig<C, E, Tc>>;
};

export type MachineOptionsFrom<T extends KeyU<'mo'>> = Extract<
  T['mo'],
  SimpleMachineOptions2
>;

export type MoF<T extends KeyU<'mo'>> = MachineOptionsFrom<T>;

export type ConfigFrom<T extends KeyU<'preConfig'>> = Extract<
  T['preConfig'],
  Config
>;

export type PrivateContextFrom<T extends KeyU<'pContext'>> = T['pContext'];

export type ContextFrom<T extends KeyU<'context'>> = Extract<
  T['context'],
  PrimitiveObject
>;

export type EventsMapFrom<T extends KeyU<'eventsMap'>> = Extract<
  T['eventsMap'],
  EventsMap
>;

export type EventsFrom<T extends KeyU<'events'>> = T['events'];

export type ActionsFrom<T extends KeyU<'actions'>> = NotUndefined<
  T['actions']
>;

export type ActionFrom<T extends KeyU<'action'>> =
  NotUndefined<T['action']> extends infer A extends any[] ? A : never;

export type ActionParamsFrom<T extends KeyU<'actionParams'>> =
  NotUndefined<T['actionParams']>;

export type ActionKeysFrom<T extends KeyU<'actions'>> =
  keyof ActionsFrom<T>;

export type GuardsFrom<T extends KeyU<'predicates'>> = NotUndefined<
  T['predicates']
>;

export type GuardKeysFrom<T extends KeyU<'predicates'>> =
  keyof GuardsFrom<T>;

export type DelaysFrom<T extends KeyU<'delays'>> = NotUndefined<
  T['delays']
>;

export type DelayKeysFrom<T extends KeyU<'delays'>> = keyof DelaysFrom<T>;

export type PromisesFrom<T extends KeyU<'promises'>> = NotUndefined<
  T['promises']
>;

export type PromiseKeysFrom<T extends KeyU<'promises'>> =
  keyof PromisesFrom<T>;

export type MachinesFrom<T extends KeyU<'machines'>> = NotUndefined<
  T['machines']
>;

export type MachineKeysFrom<T extends KeyU<'machines'>> =
  keyof MachinesFrom<T> extends infer M
    ? unknown extends M
      ? never
      : M
    : never;

export type SimpleMachineOptions<
  E extends EventsMap = EventsMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = {
  initials: RecordS<string>;
  actions?: Partial<RecordS<Action<E, Pc, Tc>>>;
  predicates?: Partial<RecordS<PredicateS<E, Pc, Tc>>>;
  promises?: Partial<RecordS<PromiseFunction<E, Pc, Tc>>>;
  delays?: Partial<RecordS<Delay<E, Pc, Tc>>>;
  machines?: Partial<RecordS<any>>;
};

export type SimpleMachineOptions2 = {
  initials: any;
  actions?: any;
  predicates?: any;
  promises?: any;
  delays?: any;
  machines?: any;
};

export type PromiseFunction<
  E extends EventsMap = EventsMap,
  Pc = any,
  TC extends PrimitiveObject = PrimitiveObject,
> = FnMap<E, Pc, TC, Promise<any>>;

export type PromiseFunction2<
  E extends EventsMap = EventsMap,
  Pc = any,
  TC extends PrimitiveObject = PrimitiveObject,
> = Fn<[Pc, TC, ToEvents<E>], Promise<any>>;

export type MachineMap<
  E extends EventsMap = EventsMap,
  Tc extends PrimitiveObject = PrimitiveObject,
> = Partial<RecordS<ChildS<E, Tc>>>;
