import type { Fn, NotUndefined } from '@bemedev/types';
import type { Action, ActionConfig, FromActionConfig } from '~actions';
import type { Delay } from '~delays';
import type { EventsMap, ToEvents } from '~events';
import type { PredicateS } from '~guards';
import type { InterpreterFrom } from '~interpreters';
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
  FnMap,
  FnMap2,
  KeyU,
  PrimitiveObject,
  RecordS,
  ReduceArray,
  SingleOrArrayR,
  SubType,
} from '~types';

export type ConfigNode = NodeConfigCompound | NodeConfigParallel;

export type ConfigNodeWithInitials =
  | NodeConfigCompoundWithInitials
  | NodeConfigParallelWithInitials;

export type Config = ConfigNode & {
  readonly machines?: SingleOrArrayR<ActionConfig>;
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

export type GetMachineKeysFromConfig<C extends Config> = FromActionConfig<
  ReduceArray<NotUndefined<C['machines']>>
>;

export type Subscriber2<
  E extends EventsMap = EventsMap,
  Tc extends PrimitiveObject = PrimitiveObject,
  U extends KeyU<'eventsMap' | 'pContext' | 'context'> = KeyU<
    'eventsMap' | 'pContext' | 'context'
  >,
> =
  | ConcatFnMap<FnMap2<E, Tc, Tc>, FnMapFrom2<U>>
  | ConcatFnMap<FnMap2<E, Tc, Tc>, FnMapFrom2<U>>['else'];

export type Child<
  E extends EventsMap = EventsMap,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends AnyMachine = AnyMachine,
> = {
  service: InterpreterFrom<T>;
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
> = Record<GetMachineKeysFromConfig<C>, Child<E, Tc>>;

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

export type MachineOptionsFrom<T extends KeyU<'mo'>> = T['mo'];

export type MoF<T extends KeyU<'mo'>> = MachineOptionsFrom<T>;

export type ConfigFrom<T extends KeyU<'preConfig'>> = T['preConfig'];

export type PrivateContextFrom<T extends KeyU<'pContext'>> = T['pContext'];

export type ContextFrom<T extends KeyU<'context'>> = T['context'];

export type EventsMapFrom<T extends KeyU<'eventsMap'>> = T['eventsMap'];

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
> = Partial<Record<string, Child<E, Tc>>>;
