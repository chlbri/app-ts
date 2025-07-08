import type {
  NOmit,
  NotUndefined,
  PrimitiveObject,
  ReduceArray,
  Require,
} from '@bemedev/types/lib/types/types';
import type {
  ActionConfig,
  ActionResult,
  FromActionConfig,
} from '~actions';
import type { EventsMap, PromiseeMap, ToEvents } from '~events';
import type {
  ExtractActionsFromTransition,
  ExtractGuardKeysFromDelayed,
  SingleOrArrayT,
  Transition,
  TransitionConfigMapA,
} from '~transitions';
import type { FnMap, FnR, SingleOrArrayL } from '~types';

/**
 * A function type that represents a promise function with map.
 *
 * @template : {@linkcode EventsMap} [E] - The events map.
 * @template : {@linkcode PromiseeMap} [P] - The promisees map.
 * @template Pc - The context type, defaults to `any`.
 * @template : {@linkcode PrimitiveObject} [Tc] - The primitive object type, defaults to `PrimitiveObject`.
 *
 * @see {@linkcode FnMap} for more details.
 * @see {@linkcode Promise} for a reduced version of this type.
 * @see {@linkcode PromiseFunction2} for a reduced version with a context.
 */
export type PromiseFunction<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = FnMap<E, P, Pc, Tc, Promise<any>>;

/**
 * A reduced version of {@linkcode PromiseFunction} that takes a context.
 *
 * @template : {@linkcode EventsMap} [E] - The events map.
 * @template : {@linkcode PromiseeMap} [P] - The promisees map.
 * @template Pc - The context type, defaults to `any`.
 * @template : {@linkcode PrimitiveObject} [Tc] - The primitive object type, defaults to `PrimitiveObject`.
 *
 * @see {@linkcode FnR} for more details.
 * @see {@linkcode Promise}
 */
export type PromiseFunction2<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = FnR<E, P, Pc, Tc, Promise<any>>;

/**
 * The finally part of a promise configuration.
 *
 * @see {@linkcode TransitionConfigMapA} for the type of transition configurations.
 * @see {@linkcode ActionConfig} for the type of action configurations.
 * @see {@linkcode NOmit}
 * @see {@linkcode Require}
 */
export type FinallyConfig =
  NOmit<TransitionConfigMapA, 'target'> extends infer F extends NOmit<
    TransitionConfigMapA,
    'target'
  >
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
export type PromiseeConfig = {
  readonly src: string;

  // Max wait time to perform the promise
  readonly max?: string;
  readonly description?: string;
  readonly then: SingleOrArrayT;
  readonly catch: SingleOrArrayT;
  readonly finally?: FinallyConfig;
};

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
export type ExtractSrcFromPromisee<T extends { src: string }> = T['src'];

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
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = {
  src: PromiseFunction2<E, P, Pc, Tc>;
  description?: string;
  then: Transition<E, P, Pc, Tc>[];
  catch: Transition<E, P, Pc, Tc>[];
  finally: Transition<E, P, Pc, Tc>[];
};

/**
 * Represents the result of a promisee execution.
 *
 * @template E - The events map, defaults to {@linkcode EventsMap}.
 * @template P - The promisees map, defaults to {@linkcode PromiseeMap}.
 * @template Pc - The context type, defaults to `any`.
 * @template : {@linkcode PrimitiveObject} Tc - The primitive object type, defaults to `PrimitiveObject`.
 *
 * @see {@linkcode ToEvents} for converting events and promisees to a unified event type.
 * @see {@linkcode ActionResult} for the type of action results.
 */
export type PromiseeResult<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = {
  event: ToEvents<E, P>;
  result: ActionResult<Pc, Tc>;
  target?: string;
};
