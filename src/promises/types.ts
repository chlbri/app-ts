import type { ActionConfig, FromActionConfig } from '#actions';
import type {
  NotUndefined,
  PrimitiveObject,
  ReduceArray,
  Require,
} from '#bemedev/globals/types';
import type {
  ActorsConfigMap,
  AllEvent,
  EventsMap,
  ToEvents2,
} from '#events';
import type {
  ExtractActionsFromTransition,
  ExtractGuardKeysFromDelayed,
  GetEventKeysFromDelayed,
  Transition,
  TransitionConfigMapA,
} from '#transitions';
import type { PromiseeConfig } from 'src/actor';
import type { FnMap, FnR, SingleOrArrayL } from 'src/types/primitives';

export type PromiseReturn<
  K extends string,
  A extends ActorsConfigMap = ActorsConfigMap,
> = NotUndefined<A['promisees']>[K]['then'] extends infer P
  ? unknown extends P
    ? never
    : P
  : never;

/**
 * A function type that represents a promise function with map.
 *
 * @template : {@linkcode EventsMap} [E] - The events map.
 * @template : {@linkcode ActorsConfigMap} [A] - The actors configuration map.
 * @template Pc - The context type, defaults to `any`.
 * @template : {@linkcode PrimitiveObject} [Tc] - The primitive object type, defaults to `PrimitiveObject`.
 *
 * @see {@linkcode FnMap} for more details.
 * @see {@linkcode Promise} for a reduced version of this type.
 * @see {@linkcode PromiseFunction2} for a reduced version with a context.
 */
export type PromiseFunction<
  E extends AllEvent = AllEvent,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
  R = any,
> = FnMap<
  E,
  Pc,
  Tc,
  T,
  Promise<R>,
  `${string}::${'then' | 'catch' | 'finally'}`
>;

/**
 * A reduced version of {@linkcode PromiseFunction} that takes a context.
 *
 * @template : {@linkcode EventsMap} [E] - The events map.
 * @template : {@linkcode ActorsConfigMap} [A] - The actors configuration map.
 * @template Pc - The context type, defaults to `any`.
 * @template : {@linkcode types} [Tc] - The primitive object type, defaults to `PrimitiveObject`.
 *
 * @see {@linkcode FnR} for more details.
 * @see {@linkcode Promise}
 */
export type PromiseFunction2<
  E extends AllEvent = AllEvent,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
  R = any,
> = FnR<E, Pc, Tc, T, Promise<R>>;

/**
 * The finally part of a promise configuration.
 *
 * @see {@linkcode TransitionConfigMapA} for the type of transition configurations.
 * @see {@linkcode ActionConfig} for the type of action configurations.
 * @see {@linkcode types}
 * @see {@linkcode types}
 */
export type FinallyConfig<Paths extends string = string> =
  TransitionConfigMapA<Paths> extends infer F extends
    TransitionConfigMapA<Paths>
    ?
        | (F | ActionConfig)
        | readonly [...Require<F, 'guards'>[], F | ActionConfig]
    : never;

/**
 * Represents a promisee configuration.
 *
 * @see {@linkcode SingleOrArrayT} for the type of then and catch.
 * @see {@linkcode FinallyConfig} for the type of finally.
 */

export type GetEventKeysFromPromisee<T extends PromiseeConfig> =
  GetEventKeysFromDelayed<Pick<T, 'then' | 'catch'>>;

/**
 * Extracts actions from a map of promisee configurations.
 *
 * @template T - The type of the map, which should be an object with an `actions` property.
 * @returns The extracted actions as a union of action configurations.
 *
 * @see {@linkcode ExtractActionsFromTransition} for the type of actions extracted from a transition.
 * @see {@linkcode SingleOrArrayL} for the type of single or array actions.
 * @see {@linkcode NotUndefined} for the type of non-undefined values.
 * @see {@linkcode ReduceArray} for the type of reduced arrays.
 */
type _ExtractActionsFromMap<T> = ExtractActionsFromTransition<
  Extract<
    ReduceArray<NotUndefined<T>>,
    { actions: SingleOrArrayL<ActionConfig> }
  >
>;

/**
 * Extracts actions from the finally part of a promise configuration.
 *
 * @template : {@linkcode FinallyConfig} T - The type of the finally configuration.
 * @returns The extracted actions as a union of action configurations.
 *
 * @see {@linkcode ReduceArray} for the type of reduced arrays.
 * @see {@linkcode ActionConfig} for the type of action configurations.
 * @see {@linkcode FromActionConfig} for converting action configurations to a specific type.
 * @see {@linkcode _ExtractActionsFromMap} for extracting actions from a map.
 */
export type ExtractActionsFromFinally<T extends FinallyConfig> =
  ReduceArray<T> extends infer Tr
    ? Tr extends ActionConfig
      ? FromActionConfig<Tr>
      : _ExtractActionsFromMap<Tr>
    : never;

/**
 * Extracts actions from a promisee configuration.
 *
 * This type combines the actions from the `then`, `catch`, and `finally` parts of the promisee configuration.
 *
 * @template : {@linkcode PromiseeConfig} T - The type of the promisee configuration.
 * @returns A union of action configurations extracted from the promisee's `then`, `catch`, and `finally` parts.
 *
 * @see {@linkcode _ExtractActionsFromMap} for extracting actions from a map.
 * @see {@linkcode ExtractActionsFromFinally} for extracting actions from the `finally`
 * part of the promisee configuration.
 * @see {@linkcode NotUndefined} for handling undefined values in the promisee configuration.
 */
export type ExtractActionsFromPromisee<T extends PromiseeConfig> =
  | _ExtractActionsFromMap<T['then']>
  | _ExtractActionsFromMap<T['catch']>
  | ExtractActionsFromFinally<NotUndefined<T['finally']>>;

/**
 * Extracts the source string from a promisee configuration.
 *
 * @template T - The type of the promisee configuration, which should have a `src` property.
 * @returns The source string of the promisee configuration.
 */
export type ExtractSrcFromActor<T extends { src: string }> = T['src'];

/**
 * Extracts the maximum wait time from a promisee configuration.
 *
 * @template T - The type of the promisee configuration, which should have a `max` property.
 * @returns The maximum wait time as a string.
 */
export type ExtractMaxFromPromisee<T extends { max: string }> = T['max'];

/**
 * Extracts guards from the delayed parts of a promisee configuration.
 *
 * @template : {@linkcode PromiseeConfig} T - The type of the promisee configuration, which should have `then`, `catch`, and `finally` properties.
 * @returns A union of guard configurations extracted from the delayed parts of the promisee configuration.
 *
 * @see {@linkcode ExtractGuardKeysFromDelayed} for extracting guards from a delayed part.
 */
export type ExtractGuardsFromPromise<T extends PromiseeConfig> =
  | ExtractGuardKeysFromDelayed<T['then']>
  | ExtractGuardKeysFromDelayed<T['catch']>
  | ExtractGuardKeysFromDelayed<T['finally']>;

/**
 * A big one !
 *
 * Represents a promisee object with a source function, and full transitions for `then`, `catch`, and `finally`.
 *
 * @template : {@linkcode EventsMap} [E] - The events map.
 * @template : {@linkcode PromiseeMap} [P] - The promisees map.
 * @template Pc - The context type, defaults to `any`.
 * @template : {@linkcode PrimitiveObject} [Tc] - The primitive object type
 *
 * @see {@linkcode PromiseFunction2} for the type of the source function.
 * @see {@linkcode Transition} for the type of transitions.
 */
export type Promisee<
  E extends AllEvent = AllEvent,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
> = {
  src: PromiseFunction2<E, Pc, Tc, T>;
  description?: string;
  then: Transition<E, Pc, Tc, T>[];
  catch: Transition<E, Pc, Tc, T>[];
  finally: Transition<E, Pc, Tc, T>[];
};

/**
 * Represents the result of a promisee execution.
 *
 * @template E - The events map, defaults to {@linkcode EventsMap}.
 * @template A - The actors map, defaults to {@linkcode ActorsConfigMap}.
 * @template Pc - The context type, defaults to `any`.
 * @template : {@linkcode PrimitiveObject} Tc - The primitive object type, defaults to `PrimitiveObject`.
 *
 * @see {@linkcode ToEvents} for converting events and promisees to a unified event type.
 * @see {@linkcode ActionResult} for the type of action results.
 */
export type PromiseeResult<
  E extends EventsMap = EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
> = {
  event: ToEvents2<E, A>;
  target: string | false;
};
