import type { Action, FromActionConfig } from '#actions';
import type { Delay } from '#delays';
import type { EventsMap, PromiseeDef, PromiseeMap } from '#events';
import type { PredicateS } from '#guards';
import type { PromiseFunction } from '#promises';
import type {
  ActivityConfig,
  BaseConfig,
  ExtractActionsFromActivity,
  ExtractDelaysFromActivity,
  ExtractGuardsFromActivity,
  FlatMapN,
  NodeConfig,
  NodeConfigCompound,
  NodeConfigParallel,
} from '#states';
import type {
  ExtractActionKeysFromTransitions,
  ExtractDelayKeysFromTransitions,
  ExtractGuardKeysFromTransitions,
  ExtractSrcFromTransitions,
  TransitionsConfig,
} from '#transitions';
import type { Decompose } from '@bemedev/decompose';
import type { types } from '@bemedev/types';
import type { Emitter } from 'src/emitters/types';
import type {
  Describer,
  FnMap,
  FnMap2,
  KeyU,
  RecordS,
  ReduceArray,
  SingleOrArrayL,
  TrueObject,
} from '~types';
import type { EVENTS_FULL } from './constants';

/**
 * Type representing the main JSON config.
 *
 * @see {@linkcode NodeConfigCompound} for compound nodes.
 * @see {@linkcode NodeConfigParallel} for parallel nodes.
 */
export type ConfigNode = NodeConfigCompound | NodeConfigParallel;

/**
 * Type representing a describer for a child service.
 *
 * @see {@linkcode Describer} for more details.
 */
export type MachineConfig = Describer | string;

/**
 * Type representing the main JSON node config of a state machine.
 *
 * @see {@linkcode ConfigNode} for more details.
 * @see {@linkcode MachineConfig}
 * @see {@linkcode SingleOrArrayL}
 */
export type Config = ConfigNode & {
  readonly machines?: SingleOrArrayL<MachineConfig>;
  readonly strict?: boolean;
};

export type NoExtraKeysConfigDef<T extends ConfigDef> = T & {
  [K in Exclude<keyof T, keyof ConfigDef>]: never;
} & {
  states?: {
    [K in keyof T['states']]: T['states'][K] extends infer TK extends
      ConfigDef
      ? NoExtraKeysConfigDef<TK>
      : never;
  };
};

export type ConfigDef = {
  readonly targets: string;
  readonly initial?: string;
  readonly states?: RecordS<ConfigDef>;
};
export type NoExtraKeysConfigNode<T extends NodeConfig> = T & {
  [K in Exclude<keyof T, keyof NodeConfig>]: never;
} & {
  states?: {
    [K in keyof T['states']]: T['states'][K] extends infer TK extends
      NodeConfig
      ? NoExtraKeysConfigNode<TK>
      : never;
  };
};
export type NoExtraKeysConfig<T extends Config> = T & {
  [K in Exclude<keyof T, keyof Config | '__tsSchema'>]: never;
} & {
  states?: Record<string, NoExtraKeysConfigNode<NodeConfig>>;
};
export type TransformConfigDef<T extends ConfigDef> = BaseConfig &
  TransitionsConfig<T['targets']> & {
    readonly initial?: T['initial'];
    readonly states?: {
      [Key in keyof T['states']]: T['states'][Key] extends infer TK extends
        ConfigDef
        ? TransformConfigDef<TK>
        : never;
    };
  };

/**
 * Type representing all action keys from a flat map of nodes.
 * @template : {@linkcode FlatMapN} [Flat] - type of the flat map of nodes
 * @returns A type representing all action keys from this flat map.
 *
 * @see {@linkcode TransitionsConfig} for the structure of transitions.
 * @see {@linkcode ActivityConfig} for the structure of activities.
 * @see {@linkcode FromActionConfig} for extracting action names from action configurations.
 * @see {@linkcode ExtractActionKeysFromTransitions} for extracting actions from transitions.
 * @see {@linkcode ExtractActionsFromActivity} for extracting actions from activities.
 * @see {@linkcode ReduceArray} for reducing arrays to a single type.
 */
type _GetKeyActionsFromFlat<Flat extends FlatMapN> = {
  [key in keyof Flat]:
    | ExtractActionKeysFromTransitions<
        Extract<Flat[key], TransitionsConfig>
      >
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

/**
 * Type representing all guard keys from a flat map of nodes.
 * @template : {@linkcode FlatMapN} [Flat] - type of the flat map of nodes
 * @returns A type representing all guard keys from this flat map.
 *
 * @see {@linkcode TransitionsConfig} for the structure of transitions.
 * @see {@linkcode ActivityConfig} for the structure of activities.
 * @see {@linkcode ExtractGuardKeysFromTransitions} for extracting guards from transitions.
 * @see {@linkcode ExtractGuardsFromActivity} for extracting guards from activities.
 */
type _GetKeyGuardsFromFlat<Flat extends FlatMapN> = {
  [key in keyof Flat]:
    | ExtractGuardKeysFromTransitions<
        Extract<Flat[key], TransitionsConfig>
      >
    | ExtractGuardsFromActivity<
        Extract<Flat[key], { activities: ActivityConfig }>
      > extends infer V
    ? unknown extends V
      ? never
      : V
    : never;
}[keyof Flat];

/**
 * Type representing all promise keys from a flat map of nodes.
 * @template : {@linkcode FlatMapN} [Flat] - type of the flat map of nodes
 * @returns A type representing all promise keys from this flat map.
 *
 * @see {@linkcode TransitionsConfig} for the structure of transitions.
 * @see {@linkcode ExtractSrcFromTransitions} for extracting promise keys from transitions.
 */
type _GetKeySrcFromFlat<Flat extends FlatMapN> = {
  [key in keyof Flat]: ExtractSrcFromTransitions<
    Extract<Flat[key], TransitionsConfig>
  > extends infer V
    ? unknown extends V
      ? never
      : V
    : never;
}[keyof Flat];

/**
 * Type representing all event types from a flat map of nodes.
 * @template : {@linkcode FlatMapN} [Flat] - type of the flat map of nodes
 * @returns A type representing all event types from this flat map.
 *
 */
type _GetEventKeysFromFlat<Flat extends FlatMapN> = {
  [key in keyof Flat]: Flat[key] extends { on: infer V } ? keyof V : never;
}[keyof Flat];

/**
 * Type representing all delay keys from a flat map of nodes.
 * @template : {@linkcode FlatMapN} [Flat] - type of the flat map of nodes
 * @returns A type representing all delay keys from this flat map.
 *
 * @see {@linkcode TransitionsConfig} for the structure of transitions.
 * @see {@linkcode ActivityConfig} for the structure of activities.
 * @see {@linkcode ExtractDelayKeysFromTransitions} for extracting delays from transitions.
 * @see {@linkcode ExtractDelaysFromActivity} for extracting delays from activities.
 */
type _GetDelayKeysFromFlat<Flat extends FlatMapN> = {
  [key in keyof Flat]:
    | ExtractDelayKeysFromTransitions<
        Extract<Flat[key], TransitionsConfig>
      >
    | ExtractDelaysFromActivity<Flat[key]> extends infer V
    ? unknown extends V
      ? never
      : V
    : never;
}[keyof Flat];

/**
 * Provide a record of all actions by key and {@linkcode Action} function.
 *
 * @template : {@linkcode FlatMapN} [Flat] - type of the flat map of nodes
 * @template : {@linkcode EventsMap} [E] - type of the events map
 * @template : {@linkcode PromiseeMap} [P] - type of the promisees map
 * @template Pc - type of the private context
 * @template : {@linkcode types.PrimitiveObject} [Tc] - type of the context
 *
 * @see {@linkcode _GetKeyActionsFromFlat} for extracting action keys from the flat map.
 */
export type GetActionsFromFlat<
  Flat extends FlatMapN,
  E extends EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
> = Record<_GetKeyActionsFromFlat<Flat>, Action<E, P, Pc, Tc>>;

/**
 * Provide a record of all guards by key and {@linkcode PredicateS} function.
 *
 * @template : {@linkcode FlatMapN} [Flat] - type of the flat map of nodes
 * @template : {@linkcode EventsMap} [E] - type of the events map
 * @template : {@linkcode PromiseeMap} [P] - type of the promisees map
 * @template Pc - type of the private context
 * @template : {@linkcode types.PrimitiveObject} [Tc] - type of the context
 *
 * @see {@linkcode _GetKeyGuardsFromFlat} for extracting guard keys from the flat map.
 */
export type GetGuardsFromFlat<
  Flat extends FlatMapN,
  E extends EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
> = Record<_GetKeyGuardsFromFlat<Flat>, PredicateS<E, P, Pc, Tc>>;

/**
 * Provide a record of all promisee src(s) by key and {@linkcode PromiseFunction} function.
 *
 * @template : {@linkcode FlatMapN} [Flat] - type of the flat map of nodes
 * @template : {@linkcode EventsMap} [E] - type of the events map
 * @template : {@linkcode PromiseeMap} [P] - type of the promisees map
 * @template Pc - type of the private context
 * @template : {@linkcode types.PrimitiveObject} [Tc] - type of the context
 *
 * @see {@linkcode _GetKeySrcFromFlat} for extracting promise src keys from the flat map.
 */
export type GetSrcFromFlat<
  Flat extends FlatMapN,
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
> = Record<_GetKeySrcFromFlat<Flat>, PromiseFunction<E, P, Pc, Tc>>;

/**
 * Provide a record of all delays by key and {@linkcode Delay} function.
 *
 * @template : {@linkcode FlatMapN} [Flat] - type of the flat map of nodes
 * @template : {@linkcode EventsMap} [E] - type of the events map
 * @template : {@linkcode PromiseeMap} [P] - type of the promisees map
 * @template Pc - type of the private context
 * @template : {@linkcode types.PrimitiveObject} [Tc] - type of the context
 *
 * @see {@linkcode _GetDelayKeysFromFlat} for extracting delay keys from the flat map.
 */
export type GetDelaysFromFlat<
  Flat extends FlatMapN,
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
> = Record<_GetDelayKeysFromFlat<Flat>, Delay<E, P, Pc, Tc>>;

/**
 * Provide a record of all events by key and {@linkcode types.PrimitiveObject} payload.
 *
 * @template : {@linkcode FlatMapN} [Flat] - type of the flat map of nodes
 *
 * @see {@linkcode _GetEventKeysFromFlat} for extracting event keys from the flat map.
 */
export type GetEventsFromFlat<Flat extends FlatMapN> = Record<
  _GetEventKeysFromFlat<Flat>,
  types.PrimitiveObject
>;

/**
 * Get all events from a machine config.
 *
 * @template : {@linkcode Config} [C] - type of the machine config
 * @returns A type representing all events from the machine config.
 *
 * @see {@linkcode FlatMapN} for the flat map structure.
 * @see {@linkcode GetEventsFromFlat} for extracting events from the flat map.
 * @see {@linkcode ConfigFrom} for extracting the config from the config.
 */
export type GetEventsFromConfig<C extends Config> = GetEventsFromFlat<
  FlatMapN<C>
>;

/**
 * Get all events from a machine.
 *
 * @template : {@linkcode KeyU}<'config'> [T] - type of the machine
 *
 * @returns A type representing all events from the machine.
 *
 * @see {@linkcode ConfigFrom} for extracting the config from the machine.
 * @see {@linkcode GetEventsFromConfig} for extracting events from the machine.
 */
export type GetEventsFromMachine<T extends KeyU<'config'>> =
  GetEventsFromConfig<ConfigFrom<T>>;

/**
 * Provide a record of all promises by key and {@linkcode PromiseeDef} type.
 *
 * @template : {@linkcode FlatMapN} [Flat] - type of the flat map of nodes
 *
 * @see {@linkcode _GetKeySrcFromFlat} for extracting promise keys from the flat map.
 */
export type GetPromiseeSrcFromFlat<Flat extends FlatMapN> = Record<
  _GetKeySrcFromFlat<Flat>,
  PromiseeDef
>;

/**
 * Get all promises from a machine config.
 *
 * @template : {@linkcode Config} [C] - type of the machine config
 * @returns A type representing all promises from the machine config.
 *
 * @see {@linkcode FlatMapN} for the flat map structure.
 * @see {@linkcode GetPromiseeSrcFromFlat} for extracting promises from the flat map.
 * @see {@linkcode FlatMapN} for extracting the config from a machine config.
 */
export type GetPromiseeSrcFromConfig<C extends Config> =
  GetPromiseeSrcFromFlat<FlatMapN<C>>;

/**
 * Get all promises from a machine.
 *
 * @template : {@linkcode KeyU}<'config'> [T] - type of the machine
 *
 * @returns A type representing all promises from the machine.
 *
 * @see {@linkcode ConfigFrom} for extracting the config from the machine.
 * @see {@linkcode GetPromiseeSrcFromConfig} for extracting promises from the machine.
 */
export type GetPromiseeSrcFromMachine<T extends KeyU<'config'>> =
  GetPromiseeSrcFromConfig<ConfigFrom<T>>;

/**
 * Get all child machines from a machine config.
 *
 * @template : {@linkcode Config} [C] - type of the machine config
 * @returns A type representing all child machines from the machine config.
 *
 * @see {@linkcode ReduceArray} for reducing arrays to a single type.
 * @see {@linkcode FromActionConfig}.
 * @see {@linkcode types.NotUndefined}
 */
export type GetMachineKeysFromConfig<C extends Config> = FromActionConfig<
  ReduceArray<types.NotUndefined<C['machines']>>
>;

/**
 * Second version decomposition of a type.
 */
export type Decompose2<T> = T extends types.Ru
  ? Decompose<types.DeepRequired<T>>
  : never;

// #region typ SubscriberType
type HeritageMap<U extends types.Ru, Tc extends types.Ru> =
  Decompose<U, { start: false; object: 'both' }> extends infer KU extends
    object
    ? {
        [key in keyof KU]?: Decompose<
          Tc,
          { start: false }
        > extends infer KT extends object
          ? SingleOrArrayL<keyof types.SubType<KT, KU[key]>>
          : never;
      }
    : never;

/**
 * Helper type to extract context from a machine.
 */
type SubNev = { contexts?: never };

// #region Sub Events Helpers
type SubEventsKeysFrom<T extends KeyU<'config' | 'context'>> =
  | keyof GetEventsFromMachine<T>
  | (GetPromiseeSrcFromMachine<T> extends infer K extends string
      ? `${K}::${'then' | 'catch'}`
      : never);

type SubEventsKeys<E extends EventsMap, P extends PromiseeMap> =
  | keyof E
  | (keyof P extends infer K extends string
      ? `${K}::${'then' | 'catch'}`
      : never);
// #endregion

/**
 * Type representing a subscriber to events from a parent machine to a child machine.
 *
 * @template : {@linkcode EventsMap} [E] - type of the events map
 * @template : {@linkcode PromiseeMap} [P] - type of the promisees map
 * @template Pc - type of the private context
 * @template : {@linkcode KeyU}<'config' | 'context'> [U] - type of the pre-config and context keys
 *
 * @see {@linkcode SingleOrArrayL} for single or array types.
 * @see {@linkcode SubEventsKeysFrom} for extracting sub-events keys from the pre-config and context keys.
 * @see {@linkcode SubEventsKeys} for extracting sub-events keys from the events map and promisees map.
 * @see {@linkcode HeritageMap} for extracting heritage map from the pre-config and context keys.
 * @see {@linkcode Primitive} for primitive types.
 * @see {@linkcode TrueObject} for true object types.
 * @see {@linkcode Decompose} for decomposing types.
 * @see {@linkcode SubNev} for the case when contexts are not defined.
 * @see {@linkcode ContextFrom} for extracting context from the pre-config and context keys.
 */
export type SubscriberType<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  U extends KeyU<'config' | 'context'> = KeyU<'config' | 'context'>,
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
    | typeof EVENTS_FULL;
} & (ContextFrom<U> extends infer CU
  ? CU extends TrueObject
    ? Pc extends TrueObject
      ? { contexts: SingleOrArrayL<HeritageMap<CU, Pc>> }
      : SubNev
    : CU extends types.Primitive
      ? Pc extends CU
        ? SubNev
        : Pc extends infer Tc1 extends TrueObject
          ? {
              contexts: SingleOrArrayL<
                types.AllowedNames<Decompose<Tc1, { start: false }>, CU>
              >;
            }
          : SubNev
      : SubNev
  : SubNev);
// #endregion

/**
 * Type representing a child service in a state machine.
 *
 * @template : {@linkcode EventsMap} [E] - type of the events map
 * @template : {@linkcode PromiseeMap} [P] - type of the promisees map
 * @template Pc - type of the private context
 * @template : {@linkcode KeyU}<'config' | 'context' | 'pContext'> [T] - type of the pre-config, context, and private context keys
 *
 * @see {@linkcode SubscriberType} for the type of subscribers to the child service.
 * @see {@linkcode PrivateContextFrom} for extracting private context from the pre-config keys.
 * @see {@linkcode ContextFrom} for extracting context from the pre-config keys.
 * @see {@linkcode SingleOrArrayL} for single or array types.
 * @see {@linkcode NoInfer} for preventing type inference in the child service type.
 */
export type ChildS<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  T extends KeyU<'config' | 'context' | 'pContext'> = KeyU<
    'config' | 'context' | 'pContext'
  >,
> = {
  machine: T;
  initials: {
    pContext: PrivateContextFrom<T>;
    context: ContextFrom<T>;
  };
  subscribers: SingleOrArrayL<SubscriberType<E, P, Pc, NoInfer<T>>>;
};

/**
 * Type representing a map for providing a child service.
 *
 * @template : {@linkcode EventsMap} [E] - type of the events map
 * @template : {@linkcode PromiseeMap} [P] - type of the promisees map
 * @template Pc - type of the private context
 * @template : {@linkcode types.PrimitiveObject} [Tc] - type of the context
 * @template : {@linkcode KeyU}<'config' | 'context' | 'pContext'> [T] - type of the pre-config, context, and private context keys
 *
 * @see {@linkcode SubscriberType} for the type of subscribers to the child service.
 * @see {@linkcode PrivateContextFrom} for extracting private context from the pre-config keys.
 * @see {@linkcode ContextFrom} for extracting context from the pre-config keys.
 * @see {@linkcode SingleOrArrayL} for single or array types.
 * @see {@linkcode NoInfer} for preventing type inference in the child service type.
 * @see {@linkcode FnMap} for the function map type.
 */
export type ChildS2<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
  T extends KeyU<'config' | 'context' | 'pContext'> = KeyU<
    'config' | 'context' | 'pContext'
  >,
> = {
  machine: T;
  initials: FnMap<
    E,
    P,
    Pc,
    Tc,
    {
      pContext: PrivateContextFrom<T>;
      context: ContextFrom<T>;
    }
  >;
  subscribers: SingleOrArrayL<SubscriberType<E, P, Pc, NoInfer<T>>>;
};

/**
 * Not used in the codebase, but provided for completeness.
 */
export type FnMapFrom<
  T extends KeyU<'eventsMap' | 'pContext' | 'context' | 'promiseesMap'>,
  R = any,
> = FnMap2<
  Extract<EventsMapFrom<T>, EventsMap>,
  Extract<PromiseesMapFrom<T>, PromiseeDef>,
  Extract<ContextFrom<T>, types.PrimitiveObject>,
  R
>;

/**
 * Type representing a record of child services from a machine config,
 * where each key is a machine name and the value is a {@linkcode ChildS} type.
 *
 * @template : {@linkcode Config} [C] - type of the machine config
 * @template : {@linkcode EventsMap} [E] - type of the events map
 * @template : {@linkcode PromiseeMap} [P] - type of the promisees map
 * @template Pc - type of the private context
 *
 * @see {@linkcode GetMachineKeysFromConfig} for extracting machine keys from the config.
 */
export type GetMachinesFromConfig<
  C extends Config,
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
> = Record<GetMachineKeysFromConfig<C>, ChildS<E, P, Pc>>;

type GetEmitterKeysFromFlat<F extends RecordS<NodeConfig>> = {
  [K in keyof F]: F[K] extends NodeConfig ? keyof F[K]['emitters'] : never;
}[keyof F];

/**
 * The big one !
 *
 * Type representing the options for a machine configuration.
 *
 * @template : {@linkcode Config} [C] - type of the machine config
 * @template : {@linkcode EventsMap} [E] - type of the events map
 * @template : {@linkcode PromiseeMap} [P] - type of the promisees map
 * @template Pc - type of the private context
 * @template : {@linkcode types.PrimitiveObject} [Tc] - type of the context
 * @template : {@linkcode FlatMapN} [Flat] - type of the flat map of nodes inside {@linkcode C}
 *
 * @returns A type representing the options for the machine configuration.
 * All options can be :
 * * `initials` - a record of initial states.
 * * `actions` - a partial record of actions, where keys are action names and values are action functions.
 * * `predicates` - a partial record of predicates, where keys are predicate names and values are predicate functions.
 * * `promises` - a partial record of promises, where keys are promise names and values are promise functions.
 * * `delays` - a partial record of delays, where keys are delay names and values are delay functions.
 * * `machines` - a partial record of child services, where keys are machine names and values are child services.
 *
 * @see {@linkcode GetInititalsFromFlat} for extracting initials from the flat map.
 * @see {@linkcode GetActionsFromFlat} for extracting actions from the flat map.
 * @see {@linkcode GetGuardsFromFlat} for extracting guards from the flat map.
 * @see {@linkcode GetSrcFromFlat} for extracting promise sources from the flat map.
 * @see {@linkcode GetDelaysFromFlat} for extracting delays from the flat map.
 * @see {@linkcode GetMachinesFromConfig} for extracting child services from the machine config
 * @see {@linkcode Partial} - intern type to make all properties optional.
 */
export type MachineOptions<
  C extends Config = Config,
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
  Flat extends FlatMapN<C> = FlatMapN<C>,
> = {
  actions?: Partial<GetActionsFromFlat<Flat, E, P, Pc, Tc>>;
  predicates?: Partial<GetGuardsFromFlat<Flat, E, P, Pc, Tc>>;
  promises?: Partial<GetSrcFromFlat<Flat, E, P, Pc, Tc>>;
  delays?: Partial<GetDelaysFromFlat<Flat, E, P, Pc, Tc>>;
  machines?: Partial<GetMachinesFromConfig<C, E, P, Pc>>;
  emitters?: Partial<
    Record<GetEmitterKeysFromFlat<Flat>, Emitter<E, P, Pc, Tc>>
  >;
};

/**
 * Getting the options from a machine.
 *
 * @template : {@linkcode KeyU}<'options'> [T] - type of the machine options
 *
 * @see {@linkcode SimpleMachineOptions2} for the structure of the machine options.
 */
export type MachineOptionsFrom<T extends KeyU<'options'>> = Extract<
  T['options'],
  SimpleMachineOptions2
>;

/**
 * Alias of {@linkcode MachineOptionsFrom}.
 */
export type MoF<T extends KeyU<'options'>> = MachineOptionsFrom<T>;

/**
 * Getting config from a machine.
 *
 * @template : {@linkcode KeyU}<'config'> [T] - type of the machine pre-config
 *
 * @see {@linkcode Config} for the structure of the machine config.
 */
export type ConfigFrom<T extends KeyU<'config'>> = Extract<
  T['config'],
  Config
>;

/**
 * Getting private context from a machine.
 *
 * @template : {@linkcode KeyU}<'pContext'> [T] - type of the machine events map
 */
export type PrivateContextFrom<T extends KeyU<'pContext'>> = T['pContext'];

/**
 * Getting context from a machine.
 *
 * @template : {@linkcode KeyU}<'context'> [T] - type of the machine context
 *
 * @see {@linkcode types.PrimitiveObject} for the structure of the context.
 */
export type ContextFrom<T extends KeyU<'context'>> = Extract<
  T['context'],
  types.PrimitiveObject
>;

/**
 * Getting events map from a machine.
 *
 * @template : {@linkcode KeyU}<'eventsMap'> [T] - type of the machine events map
 *
 * @see {@linkcode EventsMap} for the structure of the events map.
 */
export type EventsMapFrom<T extends KeyU<'eventsMap'>> = Extract<
  T['eventsMap'],
  EventsMap
>;

/**
 * Getting state from a machine.
 *
 * @template : {@linkcode KeyU}<'__state'> [T] - type of the machine state
 *
 * @see {@linkcode StateFrom} for extracting the state from the machine.
 */
export type StateFrom<T extends KeyU<'__state'>> = T['__state'];

/**
 * Getting extended state from a machine.
 *
 * @template : {@linkcode KeyU}<'__stateExtended'> [T] - type of the machine extended state
 *
 * @see {@linkcode StateExtendedFrom} for extracting the extended state from the machine.
 */
export type StateExtendedFrom<T extends KeyU<'__stateExtended'>> =
  T['__stateExtended'];

/** * Getting stateP from a machine.
 * @template : {@linkcode KeyU}<'__stateP'> [T] - type of the machine stateP
 * @see {@linkcode StatePFrom} for extracting the stateP from the machine.
 */
export type StatePFrom<T extends KeyU<'__stateP'>> = T['__stateP'];

/**
 * Getting statePextended from a machine.
 *
 * @template : {@linkcode KeyU}<'__statePextended'> [T] - type of the machine statePextended
 *
 * @see {@linkcode StatePextendedFrom} for extracting the statePextended from the machine.
 */
export type StatePextendedFrom<T extends KeyU<'__statePextended'>> =
  T['__statePextended'];

/**
 * Getting promisees map from a machine.
 *
 * @template : {@linkcode KeyU}<'promiseesMap'> [T] - type of the machine promisees map
 *
 * @see {@linkcode PromiseeMap} for the structure of the promisees map.
 */
export type PromiseesMapFrom<T extends KeyU<'promiseesMap'>> = Extract<
  T['promiseesMap'],
  PromiseeMap
>;

/**
 * Getting all events from a machine.
 *
 * @template : {@linkcode KeyU}<'__events'> [T] - type of the machine events
 *
 */
export type EventsFrom<T extends KeyU<'__events'>> = T['__events'];

/**
 * Get all actions map from a machine.
 *
 * @template : {@linkcode KeyU}<'actions'> [T] - type of the machine actions
 *
 * @see {@linkcode ActionsMapFrom} for extracting actions from the machine.
 * @see {@linkcode types.NotUndefined}
 * @see {@linkcode ActionFnFrom} for extracting action functions from the machine.
 * @see {@linkcode ActionParamsFrom} for extracting action parameters from the machine.
 * @see {@linkcode ActionKeysFrom} for extracting action keys from the machine.
 */
export type ActionsMapFrom<T extends KeyU<'actions'>> = types.NotUndefined<
  T['actions']
>;

/**
 * Get the action function from a machine.
 *
 * @template : {@linkcode KeyU}<'__actionFn'> [T] - type of the machine action function
 *
 * @see {@linkcode types.NotUndefined} for ensuring the action function is not undefined.
 */
export type ActionFnFrom<T extends KeyU<'__actionFn'>> =
  types.NotUndefined<T['__actionFn']>;

/**
 * Get the action function parameters from a machine.
 *
 * @template : {@linkcode KeyU}<'__actionParams'> [T] - type of the machine action parameters
 *
 * @see {@linkcode types.NotUndefined} for ensuring the action parameters are not undefined.
 */
export type ActionParamsFrom<T extends KeyU<'__actionParams'>> =
  types.NotUndefined<T['__actionParams']>;

/**
 * Get the action keys from a machine.
 *
 * @template : {@linkcode KeyU}<'actions'> [T] - type of the machine actions
 *
 * @see {@linkcode ActionsMapFrom} for extracting actions from the machine.
 */
export type ActionKeysFrom<T extends KeyU<'__actionKey'>> =
  T['__actionKey'];

/**
 * Get all predicates map from a machine.
 *
 * @template : {@linkcode KeyU}<'predicates'> [T] - type of the machine predicates map.
 *
 * @see {@linkcode types.NotUndefined}
 */
export type PredicatesMapFrom<T extends KeyU<'predicates'>> =
  types.NotUndefined<T['predicates']>;

/**
 * Get the predicate function from a machine.
 *
 * @template : {@linkcode KeyU}<'__predicate'> [T] - type of the machine predicate function
 *
 * @see {@linkcode types.NotUndefined} for ensuring the predicate function is not undefined.
 */
export type PredicateSFrom<T extends KeyU<'__predicate'>> =
  types.NotUndefined<T['__predicate']>;

/**
 * Get the guard keys from a machine.
 *
 * @template : {@linkcode KeyU}<'predicates'> [T] - type of the machine machine predicates map.
 *
 * @see {@linkcode types.NotUndefined} for ensuring the predicates map is not undefined.
 * @see {@linkcode PredicatesMapFrom} for extracting guards from the machine.
 */
export type GuardKeysFrom<T extends KeyU<'__guardKey'>> = T['__guardKey'];

/**
 * Get all delays map from a machine.
 *
 * @template : {@linkcode KeyU}<'delays'> [T] - type of the machine delays map.
 *
 * @see {@linkcode types.NotUndefined} for ensuring the delays map is not undefined.
 */
export type DelaysMapFrom<T extends KeyU<'delays'>> = types.NotUndefined<
  T['delays']
>;

/**
 * Get the delay keys from a machine.
 *
 * @template : {@linkcode KeyU}<'delays'> [T] - type of the machine delays map.
 *
 * @see {@linkcode types.NotUndefined} for ensuring the delays map is not undefined.
 * @see {@linkcode DelaysMapFrom} for extracting delays from the machine.
 */
export type DelayKeysFrom<T extends KeyU<'__delayKey'>> = T['__delayKey'];

/**
 * Get the delay function from a machine.
 *
 * @template : {@linkcode KeyU}<'__delay'> [T] - type of the machine delay function.
 *
 * @see {@linkcode types.NotUndefined} for ensuring the delay function is not undefined.
 */
export type DelayFnFrom<T extends KeyU<'__delay'>> = types.NotUndefined<
  T['__delay']
>;

/**
 * Get all promises map from a machine.
 *
 * @template : {@linkcode KeyU}<'promises'> [T] - type of the machine promises map.
 *
 * @see {@linkcode types.NotUndefined} for ensuring the promises map is not undefined.
 */
export type PromisesMapFrom<T extends KeyU<'promises'>> =
  types.NotUndefined<T['promises']>;

/**
 * Get the promise keys from a machine.
 *
 * @template : {@linkcode KeyU}<'promises'> [T] - type of the machine promises map.
 *
 * @see {@linkcode types.NotUndefined} for ensuring the promises map is not undefined.
 * @see {@linkcode PromisesMapFrom} for extracting promises from the machine.
 */
export type PromiseKeysFrom<T extends KeyU<'__src'>> = types.NotUndefined<
  T['__src']
>;

/**
 * Get the machines map from a machine.
 *
 * @template : {@linkcode KeyU}<'machines'> [T] - type of the machine machines map.
 *
 * @see {@linkcode types.NotUndefined} for ensuring the machines map is not undefined.
 */
export type MachinesMapFrom<T extends KeyU<'machines'>> =
  types.NotUndefined<T['machines']>;

/**
 * Get the childrend keys from a machine.
 *
 * @template : {@linkcode KeyU}<'__childKey'> [T] - type of the machine child keys.
 */
export type ChildrenKeysFrom<T extends KeyU<'__childKey'>> =
  T['__childKey'];

/**
 * Simple representation machine options
 *
 * @template : {@linkcode EventsMap} [E] - type of the events map
 * @template : {@linkcode PromiseeMap} [P] - type of the promise
 * @template Pc - type of the private context
 * @template : {@linkcode types.PrimitiveObject} [Tc] - type of the context
 *
 */
export type SimpleMachineOptions<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
> = {
  actions?: Partial<RecordS<Action<E, P, Pc, Tc>>>;
  predicates?: Partial<RecordS<PredicateS<E, P, Pc, Tc>>>;
  promises?: Partial<RecordS<PromiseFunction<E, P, Pc, Tc>>>;
  delays?: Partial<RecordS<Delay<E, P, Pc, Tc>>>;
  machines?: Partial<RecordS<any>>;
};

/**
 * Second version of simple machine options.
 *
 * @see {@linkcode Partial}
 * @see {@linkcode Record}
 *
 * @remarks
 * This type is more flexible than {@linkcode SimpleMachineOptions}
 */
export type SimpleMachineOptions2 = Partial<
  Record<
    | 'actions'
    | 'predicates'
    | 'promises'
    | 'delays'
    | 'machines'
    | 'emitters',
    any
  >
>;

/**
 * Type representing a function that returns a {@linkcode FnMap} of promise.
 *
 * @template : {@linkcode EventsMap} [E] - type of the events map
 * @template : {@linkcode PromiseeMap} [P] - type of the promise
 * @template Pc - type of the private context
 * @template : {@linkcode types.PrimitiveObject} [Tc] - type of the context
 *
 * @see {@linkcode Promise}
 *
 */

/**
 * Type representing a function that returns a promise.
 *
 * @template : {@linkcode EventsMap} [E] - type of the events map
 * @template : {@linkcode PromiseeMap} [P] - type of the promise
 * @template Pc - type of the private context
 * @template : {@linkcode types.PrimitiveObject} [Tc] - type of the context
 *
 * @see {@linkcode Promise}
 *
 * @remarks
 * This type is more flexible than {@linkcode PromiseFunction}
 */

/**
 * Type representing a map of child machines.
 *
 * @template : {@linkcode EventsMap} [E] - type of the events map
 * @template : {@linkcode PromiseeMap} [P] - type of the promisees map
 * @template Pc - type of the private context
 *
 * @see {@linkcode ChildS} for the structure of a child service.
 * @see {@linkcode RecordS} for the record structure.
 * @see {@linkcode Partial}
 */
export type MachineMap<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
> = Partial<RecordS<ChildS<E, P, Pc>>>;
