import type { Decompose } from '@bemedev/decompose';
import type {
  DeepNotUndefined,
  Fn,
  NotUndefined,
  Primitive,
  Ru,
} from '@bemedev/types';
import type { Action, ActionConfig, FromActionConfig } from '~actions';
import type { Delay } from '~delays';
import type {
  EventsMap,
  PromiseeDef,
  PromiseeMap,
  ToEvents,
} from '~events';
import type { PredicateS } from '~guards';
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
  Describer,
  FnMap,
  FnMap2,
  KeyU,
  PrimitiveObject,
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

export type InitialsFromConfig<C extends Config> = GetInititalsFromFlat<
  FlatMapN<C>
>;

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
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = Record<_GetKeyActionsFromFlat<Flat>, Action<E, P, Pc, Tc>>;

export type GetGuardsFromFlat<
  Flat extends FlatMapN,
  E extends EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = Record<_GetKeyGuardsFromFlat<Flat>, PredicateS<E, P, Pc, Tc>>;

export type GetSrcFromFlat<
  Flat extends FlatMapN,
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = Record<_GetKeySrcFromFlat<Flat>, PromiseFunction<E, P, Pc, Tc>>;

export type GetDelaysFromFlat<
  Flat extends FlatMapN,
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = Record<_GetKeyDelaysFromFlat<Flat>, Delay<E, P, Pc, Tc>>;

export type GetEventsFromFlat<Flat extends FlatMapN> = Record<
  _GetEventsFromFlat<Flat>,
  PrimitiveObject
>;

export type GetEventsFromConfig<C extends Config> = GetEventsFromFlat<
  FlatMapN<C>
>;

export type GetEventsFromMachine<T extends KeyU<'preConfig'>> =
  GetEventsFromConfig<ConfigFrom<T>>;

export type GetPromiseeSrcFromFlat<Flat extends FlatMapN> = Record<
  _GetKeySrcFromFlat<Flat>,
  PromiseeDef
>;

export type GetPromiseeSrcFromConfig<C extends Config> =
  GetPromiseeSrcFromFlat<FlatMapN<C>>;

export type GetPromiseeSrcFromMachine<T extends KeyU<'preConfig'>> =
  GetEventsFromConfig<ConfigFrom<T>>;

export type GetMachineKeysFromConfig<C extends Config> = FromActionConfig<
  ReduceArray<NotUndefined<C['machines']>>
>;

export type Decompose2<T> = T extends Ru
  ? Decompose<DeepNotUndefined<T>>
  : never;

type HeritageMap<U extends Ru, Tc extends Ru> =
  Decompose<U> extends infer KU extends object
    ? {
        [key in keyof KU]?: Decompose<Tc> extends infer KT extends object
          ? SingleOrArrayL<keyof SubType<KT, KU[key]>>
          : never;
      }
    : never;

type SubNev = { contexts?: never };

type SubEventsKeysFrom<T extends KeyU<'preConfig' | 'context'>> =
  | keyof GetEventsFromMachine<T>
  | (GetPromiseeSrcFromMachine<T> extends infer K extends string
      ? `${K}::${'then' | 'catch'}`
      : never);

type SubEventsKeys<E extends EventsMap, P extends PromiseeMap> =
  | keyof E
  | (keyof P extends infer K extends string
      ? `${K}::${'then' | 'catch'}`
      : never);

export type Subscriber<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  U extends KeyU<'preConfig' | 'context'> = KeyU<'preConfig' | 'context'>,
> = {
  events:
    | SingleOrArrayL<
        | {
            [key in SubEventsKeysFrom<U>]?: SingleOrArrayL<
              SubEventsKeys<E, P>
            >;
          }
        | SubEventsKeys<E, P>
      >
    | 'full';
} & (ContextFrom<U> extends infer CU
  ? CU extends Ru
    ? Pc extends Ru
      ? { contexts: SingleOrArrayL<HeritageMap<CU, Pc>> }
      : SubNev
    : CU extends Primitive
      ? Pc extends CU
        ? SubNev
        : Pc extends infer Tc1 extends Ru
          ? { contexts: SingleOrArrayL<keyof SubType<Decompose<Tc1>, CU>> }
          : SubNev
      : SubNev
  : SubNev);

export type ChildS<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  T extends KeyU<'preConfig' | 'context' | 'pContext'> = KeyU<
    'preConfig' | 'context' | 'pContext'
  >,
> = {
  machine: T;
  initials: {
    pContext: PrivateContextFrom<T>;
    context: ContextFrom<T>;
  };
  subscribers: SingleOrArrayL<Subscriber<E, P, Pc, NoInfer<T>>>;
};

export type FnMapFrom<
  T extends KeyU<'eventsMap' | 'pContext' | 'context' | 'promiseesMap'>,
  R = any,
> = FnMap2<
  Extract<EventsMapFrom<T>, EventsMap>,
  Extract<PromiseesMapFrom<T>, PromiseeDef>,
  Extract<ContextFrom<T>, PrimitiveObject>,
  R
>;

export type GetMachinesFromConfig<
  C extends Config,
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
> = Record<GetMachineKeysFromConfig<C>, ChildS<E, P, Pc>>;

export type MachineOptions<
  C extends Config = Config,
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  Flat extends FlatMapN<C> = FlatMapN<C>,
> = {
  initials: GetInititalsFromFlat<Flat>;
  actions?: Partial<GetActionsFromFlat<Flat, E, P, Pc, Tc>>;
  predicates?: Partial<GetGuardsFromFlat<Flat, E, P, Pc, Tc>>;
  promises?: Partial<GetSrcFromFlat<Flat, E, P, Pc, Tc>>;
  delays?: Partial<GetDelaysFromFlat<Flat, E, P, Pc, Tc>>;
  machines?: Partial<GetMachinesFromConfig<C, E, P, Pc>>;
};

export type MachineOptionsFrom<T extends KeyU<'options'>> = Extract<
  T['options'],
  SimpleMachineOptions2
>;

export type MoF<T extends KeyU<'options'>> = MachineOptionsFrom<T>;

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

export type PromiseesMapFrom<T extends KeyU<'promiseesMap'>> = Extract<
  T['promiseesMap'],
  PromiseeMap
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
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = {
  initials: RecordS<string>;
  actions?: Partial<RecordS<Action<E, P, Pc, Tc>>>;
  predicates?: Partial<RecordS<PredicateS<E, P, Pc, Tc>>>;
  promises?: Partial<RecordS<PromiseFunction<E, P, Pc, Tc>>>;
  delays?: Partial<RecordS<Delay<E, P, Pc, Tc>>>;
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
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  TC extends PrimitiveObject = PrimitiveObject,
> = FnMap<E, P, Pc, TC, Promise<any>>;

export type PromiseFunction2<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  TC extends PrimitiveObject = PrimitiveObject,
> = Fn<[Pc, TC, ToEvents<E, P>], Promise<any>>;

export type MachineMap<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
> = Partial<RecordS<ChildS<E, P, Pc>>>;
