import type { Action2, FromActionConfig } from '#actions';
import type {
  Equals,
  Keys,
  NotUndefined,
  PrimitiveObject,
} from '#bemedev/globals/types';
import type { DelayFunction2 } from '#delays';
import type {
  EmitterDef,
  EmitterFunction2,
  EmitterReturn,
  EmittersMap,
} from '#emitters';
import type {
  ActorsConfigMap,
  EventObject,
  EventsMap,
  PromiseeDef,
  ToEventObject,
  ToEvents,
} from '#events';
import type { PredicateS, PredicateS2 } from '#guards';
import type {
  PromiseFunction,
  PromiseFunction2,
  PromiseReturn,
} from '#promises';
import type {
  ActivityConfig,
  BaseConfig,
  ExtractActionsFromActivity,
  ExtractDelaysFromActivity,
  ExtractGuardsFromActivity,
  ExtractTagsFromFlat,
  FlatMapN,
  NodeConfig,
  NodeConfigCompound,
  NodeConfigParallel,
} from '#states';
import type {
  ExtractActionKeysFromTransitions,
  ExtractChildKeysFromTransitions,
  ExtractDelayKeysFromTransitions,
  ExtractEmitterSrcKeyFromTransitions,
  ExtractGuardKeysFromTransitions,
  ExtractPromiseeSrcKeyFromTransitions,
  Transition,
  TransitionsConfig,
} from '#transitions';
import type { Recompose } from '@bemedev/decompose';
import type { Observable } from 'rxjs';
import type {
  Describer,
  FnMap,
  FnMapR,
  FnR,
  Identify,
  KeyU,
  RecordS,
  ReduceArray,
} from '~types';

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
export type Config = NodeConfig & {
  readonly strict?: boolean;
  readonly __longRuns?: boolean;
};

export type ChildEvents<
  K extends string,
  A extends ActorsConfigMap = ActorsConfigMap,
> = NotUndefined<A['children']>[K] extends infer P ? P : never;

export type ChildFunction<
  E extends EventObject = EventObject,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
  R extends { eventsMap: any } = { eventsMap: any },
> = FnMap<E, Pc, Tc, T, R, `${string}::on::${string}`>;

export type ChildFunction2<
  E extends EventObject = EventObject,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
  R extends { eventsMap: any } = { eventsMap: any },
> = FnR<E, Pc, Tc, T, R>;

export type ChildrenMap<
  E extends EventObject = EventObject,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
> = RecordS<ChildFunction<E, Pc, Tc, T>>;

export type ExtractTagsFromConfig<T extends Config> = ExtractTagsFromFlat<
  FlatMapN<T>
>;

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
 * @see {@linkcode ExtractPromiseeSrcKeyFromTransitions} for extracting promise keys from transitions.
 */
type _GetPromiseeSrcKeysFromFlat<Flat extends FlatMapN> = {
  [key in keyof Flat]: ExtractPromiseeSrcKeyFromTransitions<
    Extract<Flat[key], TransitionsConfig>
  > extends infer V
    ? unknown extends V
      ? never
      : V
    : never;
}[keyof Flat];

type _GetEmitterSrcKeyFromFlat<Flat extends FlatMapN> = {
  [key in keyof Flat]: ExtractEmitterSrcKeyFromTransitions<
    Extract<Flat[key], TransitionsConfig>
  > extends infer V
    ? unknown extends V
      ? never
      : V
    : never;
}[keyof Flat];

type _GetChildKeysFromFlat<Flat extends FlatMapN> = {
  [key in keyof Flat]: ExtractChildKeysFromTransitions<
    Extract<Flat[key], TransitionsConfig>
  >;
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
 * @template : {@linkcode ActorsConfigMap} [P] - type of the promisees map
 * @template Pc - type of the private context
 * @template : {@linkcode PrimitiveObject} [Tc] - type of the context
 *
 * @see {@linkcode _GetKeyActionsFromFlat} for extracting action keys from the flat map.
 */
export type GetActionsFromFlat<
  Flat extends FlatMapN,
  E extends EventObject = EventObject,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
> = Record<_GetKeyActionsFromFlat<Flat>, Action2<E, Pc, Tc, T>>;

/**
 * Provide a record of all guards by key and {@linkcode PredicateS} function.
 *
 * @template : {@linkcode FlatMapN} [Flat] - type of the flat map of nodes
 * @template : {@linkcode EventsMap} [E] - type of the events map
 * @template : {@linkcode ActorsConfigMap} [P] - type of the promisees map
 * @template Pc - type of the private context
 * @template : {@linkcode PrimitiveObject} [Tc] - type of the context
 *
 * @see {@linkcode _GetKeyGuardsFromFlat} for extracting guard keys from the flat map.
 */
export type GetGuardsFromFlat<
  Flat extends FlatMapN,
  E extends EventObject = EventObject,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
> = Record<_GetKeyGuardsFromFlat<Flat>, PredicateS<E, Pc, Tc, T>>;

export type GetPromiseSrcsFromFlat<
  Flat extends FlatMapN,
  E extends EventObject = EventObject,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
> = {
  [key in _GetPromiseeSrcKeysFromFlat<Flat>]: PromiseFunction<
    E,
    Pc,
    Tc,
    T,
    {
      eventsMap: NotUndefined<A['children']>[key];
    }
  >;
};

export type GetEmitterSrcsKeyFromFlat<
  Flat extends FlatMapN,
  A extends ActorsConfigMap = ActorsConfigMap,
> = {
  [key in _GetEmitterSrcKeyFromFlat<Flat>]: Observable<
    EmitterReturn<key, A>
  >;
};

/* Record<
  _GetPromiseeSrcKeyFromFlat<Flat>,
  PromiseFunction<E, A, Pc, Tc>
> */

/**
 * Provide a record of all delays by key and {@linkcode DelayFunction} function.
 *
 * @template : {@linkcode FlatMapN} [Flat] - type of the flat map of nodes
 * @template : {@linkcode EventsMap} [E] - type of the events map
 * @template : {@linkcode ActorsConfigMap} [A] - type of the actors config map
 * @template Pc - type of the private context
 * @template : {@linkcode PrimitiveObject} [Tc] - type of the context
 *
 * @see {@linkcode _GetDelayKeysFromFlat} for extracting delay keys from the flat map.
 */
export type GetDelaysFromFlat<
  Flat extends FlatMapN,
  E extends EventObject = EventObject,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
> = Record<_GetDelayKeysFromFlat<Flat>, DelayFunction2<E, Pc, Tc, T>>;

/**
 * Provide a record of all events by key and {@linkcode PrimitiveObject} payload.
 *
 * @template : {@linkcode FlatMapN} [Flat] - type of the flat map of nodes
 *
 * @see {@linkcode _GetEventKeysFromFlat} for extracting event keys from the flat map.
 */
export type GetEventsFromFlat<Flat extends FlatMapN> = Record<
  _GetEventKeysFromFlat<Flat>,
  PrimitiveObject
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
 * @see {@linkcode _GetPromiseeSrcKeysFromFlat} for extracting promise keys from the flat map.
 */
export type GetPromiseesSrcKeyFromFlat<Flat extends FlatMapN> = Record<
  _GetPromiseeSrcKeysFromFlat<Flat>,
  PromiseeDef
>;

export type GetPromisesFromFlat<
  Flat extends FlatMapN,
  E extends EventObject = EventObject,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
> = {
  [key in _GetPromiseeSrcKeysFromFlat<Flat>]?: PromiseFunction2<
    E,
    Pc,
    Tc,
    T,
    PromiseReturn<key, A>
  >;
};

/**
 * Get all promises from a machine config.
 *
 * @template : {@linkcode Config} [C] - type of the machine config
 * @returns A type representing all promises from the machine config.
 *
 * @see {@linkcode FlatMapN} for the flat map structure.
 * @see {@linkcode GetPromiseesSrcKeyFromFlat} for extracting promises from the flat map.
 * @see {@linkcode FlatMapN} for extracting the config from a machine config.
 */
export type GetPromiseeSrcKeysFromConfig<C extends Config> =
  GetPromiseesSrcKeyFromFlat<FlatMapN<C>>;

/**
 * Get all promises from a machine.
 *
 * @template : {@linkcode KeyU}<'config'> [T] - type of the machine
 *
 * @returns A type representing all promises from the machine.
 *
 * @see {@linkcode ConfigFrom} for extracting the config from the machine.
 * @see {@linkcode GetPromiseeSrcKeysFromConfig} for extracting promises from the machine.
 */
export type GetPromiseesSrcFromMachine<T extends KeyU<'config'>> =
  GetPromiseeSrcKeysFromConfig<ConfigFrom<T>>;

export type GetEmittersSrcKeyFromFlat<Flat extends FlatMapN> = Record<
  _GetEmitterSrcKeyFromFlat<Flat>,
  EmitterDef
>;

export type GetEmittersSrcFromFlat<
  Flat extends FlatMapN,
  E extends EventObject = EventObject,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
> = {
  [key in _GetEmitterSrcKeyFromFlat<Flat>]: EmitterFunction2<
    E,
    Pc,
    Tc,
    T,
    EmitterReturn<key, A>
  >;
};

/**
 * Get all emitters from a machine config.
 *
 * @template : {@linkcode Config} [C] - type of the machine config
 * @returns A type representing all emitters from the machine config.
 *
 * @see {@linkcode FlatMapN} for the flat map structure.
 * @see {@linkcode GetEmittersSrcKeyFromFlat} for extracting promises from the flat map.
 * @see {@linkcode FlatMapN} for extracting the config from a machine config.
 */
export type GetEmittersSrcFromConfig<C extends Config> =
  GetEmittersSrcKeyFromFlat<FlatMapN<C>>;

/**
 * Get all emitters from a machine.
 *
 * @template : {@linkcode KeyU}<'config'> [T] - type of the machine
 *
 * @returns A type representing all emitters from the machine.
 *
 * @see {@linkcode ConfigFrom} for extracting the config from the machine.
 * @see {@linkcode GetEmittersSrcFromConfig} for extracting promises from the machine.
 */
export type GetEmittersSrcFromMachine<T extends KeyU<'config'>> =
  GetEmittersSrcFromConfig<ConfigFrom<T>>;

export type GetChildrenSrcKeysFromFlat<
  Flat extends FlatMapN,
  G extends _GetChildKeysFromFlat<Flat> = _GetChildKeysFromFlat<Flat>,
> = {
  [key in G['src']]: Record<Extract<G, { src: key }>['on'], any>;
};

export type GetChildrenSrcKeysFromFlat2<
  Flat extends FlatMapN,
  G extends _GetChildKeysFromFlat<Flat> = _GetChildKeysFromFlat<Flat>,
> = {
  [key in G['src']]: Extract<G, { src: key }> extends infer E extends G
    ? {
        on: Record<E['on'], any>;
        context: keyof E['contexts'];
        parentPcontext: E['contexts'][keyof E['contexts']];
      }
    : never;
};

export type GetChildrenSrcFromFlat<
  Flat extends FlatMapN,
  E extends EventObject = EventObject,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
  G extends _GetChildKeysFromFlat<Flat> = _GetChildKeysFromFlat<Flat>,
> = {
  [key in G['src']]: ChildFunction2<
    E,
    Pc,
    Tc,
    T,
    {
      eventsMap: ChildEvents<key & string, A>;
      context: Recomposer<keyof Extract<G, { src: key }>['contexts']>;
    }
  >;
};

/**
 * Get all child machines from a machine config.
 *
 * @template : {@linkcode Config} [C] - type of the machine config
 * @returns A type representing all child machines from the machine config.
 *
 * @see {@linkcode FlatMapN} for the flat map structure.
 * @see {@linkcode GetChildrenSrcKeysFromFlat} for extracting promises from the flat map.
 * @see {@linkcode FlatMapN} for extracting the config from a machine config.
 */
export type GetChildrenSrcFromConfig<C extends Config> =
  GetChildrenSrcKeysFromFlat<FlatMapN<C>>;

/**
 * Get all child machines from a machine.
 *
 * @template : {@linkcode KeyU}<'config'> [T] - type of the machine
 *
 * @returns A type representing all child machines from the machine.
 *
 * @see {@linkcode ConfigFrom} for extracting the config from the machine.
 * @see {@linkcode GetChildrenSrcFromConfig} for extracting child machines from the machine.
 */
export type GetChildrenSrcFromMachine<T extends KeyU<'config'>> =
  GetChildrenSrcFromConfig<ConfigFrom<T>>;

export type GetActorsFromFlat<
  Flat extends FlatMapN,
  E extends EventObject = EventObject,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
> = {
  children: Partial<GetChildrenSrcFromFlat<Flat, E, A, Pc, Tc, T>>;
  emitters: Partial<GetEmittersSrcFromFlat<Flat, E, A, Pc, Tc, T>>;
  promises: Partial<GetPromisesFromFlat<Flat, E, A, Pc, Tc, T>>;
};

export type GetActorsFromConfig<
  C extends Config,
  E extends EventObject = EventObject,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
> = GetActorsFromFlat<FlatMapN<C>, E, A, Pc, Tc, T>;

export type GetActorsFromMachine<
  M extends KeyU<'config'>,
  E extends EventObject = EventObject,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
> = GetActorsFromConfig<ConfigFrom<M>, E, A, Pc, Tc, T>;

export type GetActorsSrcKeysFromFlat<Flat extends FlatMapN> = {
  children: GetChildrenSrcKeysFromFlat<Flat>;
  emitters: GetEmittersSrcKeyFromFlat<Flat>;
  promisees: GetPromiseesSrcKeyFromFlat<Flat>;
};

export type Recomposer<P extends Keys> =
  Equals<P, '.'> extends true
    ? any
    : Equals<P, ''> extends true
      ? any
      : Recompose<Record<Exclude<P, '' | '.'>, unknown>>;

export type GetActorsSrcKeysFromFlat2<
  Flat extends FlatMapN,
  G extends _GetChildKeysFromFlat<Flat> = _GetChildKeysFromFlat<Flat>,
> = {
  children: {
    [key in G['src']]: Record<Extract<G, { src: key }>['on'], any>;
  };
  emitters: GetEmittersSrcKeyFromFlat<Flat>;
  promisees: GetPromiseesSrcKeyFromFlat<Flat>;
  pContext: Recomposer<G['contexts'][keyof G['contexts']]>;
};

export type GetActorKeysFromConfig<C extends Config> =
  GetActorsSrcKeysFromFlat<FlatMapN<C>>;

export type GetActorKeysFromConfig2<C extends Config> =
  GetActorsSrcKeysFromFlat2<FlatMapN<C>>;

export type GetActorKeysFromMachine<T extends KeyU<'config'>> =
  GetActorKeysFromConfig<ConfigFrom<T>>;

export type ChildConfigDef = EventsMap;

export type ChildConfigMap = RecordS<ChildConfigDef>;

export type Child<
  E extends EventObject = EventObject,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
  R extends { eventsMap: any } = { eventsMap: any },
> = {
  src: ChildFunction2<E, Pc, Tc, T, R>;
  description?: string;
  id: string;
  on: Identify<RecordS<Transition<E, Pc, Tc, T>>>[];
  contexts: string[];
};

/**
 * Not used in the codebase, but provided for completeness.
 */
export type FnMapFrom<
  T extends KeyU<
    '__eventsO' | 'pContext' | 'context' | 'actorsMap' | '__tag'
  >,
  R = any,
  Ex extends string = string,
> = FnMapR<
  Extract<T['__eventsO'], EventObject>,
  ContextFrom<T>,
  Extract<T['__tag'], string>,
  R,
  Ex
>;

/**
 * The big one !
 *
 * Type representing the options for a machine configuration.
 *
 * @template : {@linkcode Config} [C] - type of the machine config
 * @template : {@linkcode EventsMap} [E] - type of the events map
 * @template : {@linkcode ActorsConfigMap} [A] - type of the actors config map
 * @template Pc - type of the private context
 * @template : {@linkcode PrimitiveObject} [Tc] - type of the context
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
 * @see {@linkcode GetPromiseSrcsFromFlat} for extracting promise sources from the flat map.
 * @see {@linkcode GetDelaysFromFlat} for extracting delays from the flat map.
 * @see {@linkcode GetMachinesFromConfig} for extracting child services from the machine config
 * @see {@linkcode Partial} - intern type to make all properties optional.
 */
export type MachineOptions<
  C extends Config = Config,
  E extends EventsMap = EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
  Flat extends FlatMapN<C, false> = FlatMapN<C, false>,
  Eo extends ToEventObject<ToEvents<E, A>> = ToEventObject<ToEvents<E, A>>,
> = Partial<{
  actions: Partial<GetActionsFromFlat<Flat, Eo, Pc, Tc, T>>;
  predicates: Partial<GetGuardsFromFlat<Flat, Eo, Pc, Tc, T>>;
  delays: Partial<GetDelaysFromFlat<Flat, Eo, Pc, Tc, T>>;
  actors: Partial<GetActorsFromFlat<Flat, Eo, A, Pc, Tc, T>>;
}>;

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
 * @see {@linkcode PrimitiveObject} for the structure of the context.
 */
export type ContextFrom<T extends KeyU<'context'>> = Extract<
  T['context'],
  PrimitiveObject
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

export type DecomposedStateFrom<T extends KeyU<'__decomposedState'>> =
  T['__decomposedState'];

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
 * @see {@linkcode ActorsConfigMap} for the structure of the promisees map.
 */
export type ActorsMapFrom<T extends KeyU<'actorsMap'>> = Extract<
  T['actorsMap'],
  ActorsConfigMap
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
 * @see {@linkcode NotUndefined}
 * @see {@linkcode ActionFnFrom} for extracting action functions from the machine.
 * @see {@linkcode ActionParamsFrom} for extracting action parameters from the machine.
 * @see {@linkcode ActionKeysFrom} for extracting action keys from the machine.
 */
export type ActionsMapFrom<T extends KeyU<'actions'>> = NotUndefined<
  T['actions']
>;

export type AddOptionsFrom<T extends KeyU<'addOptions'>> = NotUndefined<
  T['addOptions']
>;

/**
 * Get the action function from a machine.
 *
 * @template : {@linkcode KeyU}<'__actionFn'> [T] - type of the machine action function
 *
 * @see {@linkcode NotUndefined} for ensuring the action function is not undefined.
 */
export type ActionFnFrom<T extends KeyU<'__actionFn'>> = NotUndefined<
  T['__actionFn']
>;

/**
 * Get the action function parameters from a machine.
 *
 * @template : {@linkcode KeyU}<'__actionParams'> [T] - type of the machine action parameters
 *
 * @see {@linkcode NotUndefined} for ensuring the action parameters are not undefined.
 */
export type ActionParamsFrom<T extends KeyU<'__actionParams'>> =
  NotUndefined<T['__actionParams']>;

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
 * @see {@linkcode NotUndefined}
 */
export type PredicatesMapFrom<T extends KeyU<'predicates'>> = NotUndefined<
  T['predicates']
>;

/**
 * Get the predicate function from a machine.
 *
 * @template : {@linkcode KeyU}<'__predicate'> [T] - type of the machine predicate function
 *
 * @see {@linkcode NotUndefined} for ensuring the predicate function is not undefined.
 */
export type PredicateSFrom<T extends KeyU<'__predicate'>> = NotUndefined<
  T['__predicate']
>;

/**
 * Get the guard keys from a machine.
 *
 * @template : {@linkcode KeyU}<'predicates'> [T] - type of the machine machine predicates map.
 *
 * @see {@linkcode NotUndefined} for ensuring the predicates map is not undefined.
 * @see {@linkcode PredicatesMapFrom} for extracting guards from the machine.
 */
export type GuardKeysFrom<T extends KeyU<'__guardKey'>> = T['__guardKey'];

/**
 * Get all delays map from a machine.
 *
 * @template : {@linkcode KeyU}<'delays'> [T] - type of the machine delays map.
 *
 * @see {@linkcode NotUndefined} for ensuring the delays map is not undefined.
 */
export type DelaysMapFrom<T extends KeyU<'delays'>> = NotUndefined<
  T['delays']
>;

/**
 * Get the delay keys from a machine.
 *
 * @template : {@linkcode KeyU}<'delays'> [T] - type of the machine delays map.
 *
 * @see {@linkcode NotUndefined} for ensuring the delays map is not undefined.
 * @see {@linkcode DelaysMapFrom} for extracting delays from the machine.
 */
export type DelayKeysFrom<T extends KeyU<'__delayKey'>> = T['__delayKey'];

/**
 * Get the delay function from a machine.
 *
 * @template : {@linkcode KeyU}<'__delay'> [T] - type of the machine delay function.
 *
 * @see {@linkcode NotUndefined} for ensuring the delay function is not undefined.
 */
export type DelayFnFrom<T extends KeyU<'__delay'>> = NotUndefined<
  T['__delay']
>;

/**
 * Get all promises map from a machine.
 *
 * @template : {@linkcode KeyU}<'promises'> [T] - type of the machine promises map.
 *
 * @see {@linkcode NotUndefined} for ensuring the promises map is not undefined.
 */
export type PromisesMapFrom<T extends KeyU<'promises'>> = NotUndefined<
  T['promises']
>;

/**
 * Get the promise keys from a machine.
 *
 * @template : {@linkcode KeyU}<'promises'> [T] - type of the machine promises map.
 *
 * @see {@linkcode NotUndefined} for ensuring the promises map is not undefined.
 * @see {@linkcode PromisesMapFrom} for extracting promises from the machine.
 */
export type PromiseKeysFrom<T extends KeyU<'__src'>> = NotUndefined<
  T['__src']
>;

/**
 * Get the machines map from a machine.
 *
 * @template : {@linkcode KeyU}<'machines'> [T] - type of the machine machines map.
 *
 * @see {@linkcode NotUndefined} for ensuring the machines map is not undefined.
 */
export type MachinesMapFrom<T extends KeyU<'machines'>> = NotUndefined<
  T['machines']
>;

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
 * @template : {@linkcode ActorsConfigMap} [A] - type of the actors config map
 * @template Pc - type of the private context
 * @template : {@linkcode PrimitiveObject} [Tc] - type of the context
 *
 */
export type SimpleMachineOptions<
  E extends EventsMap = EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
  Eo extends ToEventObject<ToEvents<E, A>> = ToEventObject<ToEvents<E, A>>,
> = Partial<{
  actions: Partial<RecordS<Action2<Eo, Pc, Tc, T>>>;
  predicates: Partial<RecordS<PredicateS2<Eo, Pc, Tc, T>>>;
  delays: Partial<RecordS<DelayFunction2<Eo, Pc, Tc, T>>>;
  actors: Partial<{
    children: RecordS<ChildFunction2<Eo, Pc, Tc, T>>;
    emitters: EmittersMap<Eo, Pc, Tc, T>;
    promises: RecordS<PromiseFunction2<Eo, Pc, Tc, T>>;
  }>;
}>;

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
  Record<'actions' | 'predicates' | 'delays', any> &
    Record<
      'actors',
      {
        children?: RecordS<any>;
        emitters?: RecordS<any>;
        promises?: RecordS<any>;
      }
    >
>;

export type ExtractContextsKeyFromChild<
  T extends { contexts: Record<string, string> },
> = keyof T['contexts'];

export type ExtractEventsKeyFromChild<
  T extends { on: Record<string, any> },
> = keyof T['on'];
