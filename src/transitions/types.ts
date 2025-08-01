import type { types } from '@bemedev/types';
import type { Action, ActionConfig, FromActionConfig } from '~actions';
import type { EventsMap, PromiseeMap } from '~events';
import type { FromGuard, GuardConfig, Predicate } from '~guards';
import type {
  ExtractActionsFromPromisee,
  ExtractGuardsFromPromise,
  ExtractMaxFromPromisee,
  ExtractSrcFromPromisee,
  Promisee,
  PromiseeConfig,
} from '~promises';
import type {
  Identitfy,
  RecordS,
  ReduceArray,
  SingleOrArrayL,
} from '~types';

/**
 * Represents the simpliest configuration map for a transition.
 * Used as Helper
 */
type _TransitionConfigMap = {
  readonly target?: string;
  // readonly internal?: boolean;
  readonly actions?: SingleOrArrayL<ActionConfig>;
  readonly guards?: SingleOrArrayL<GuardConfig>;
  readonly description?: string;
};

/**
 * Extracts actions from a transition configuration.
 *
 * @template T - The transition configuration type.
 * @returns The actions extracted from the transition configuration.
 *
 * @see {@linkcode ActionConfig} for the structure of action configurations.
 * @see {@linkcode FromActionConfig} for converting action configurations to actions.
 * @see {@linkcode ReduceArray} for reducing arrays to their elements.
 * @see {@linkcode SingleOrArrayL} for handling single or array types.
 */
export type ExtractActionsFromTransition<
  T extends { actions: SingleOrArrayL<ActionConfig> },
> =
  ReduceArray<T['actions']> extends infer R extends ActionConfig
    ? FromActionConfig<R>
    : never;

/**
 * Extracts guards from a transition configuration.
 *
 * @template T - The transition configuration type.
 * @returns The guards extracted from the transition configuration.
 *
 * @see {@linkcode GuardConfig} for the structure of guard configurations.
 * @see {@linkcode FromGuard} for converting guard configurations to predicates.
 * @see {@linkcode ReduceArray} for reducing arrays to their elements.
 * @see {@linkcode SingleOrArrayL} for handling single or array types.
 */
export type ExtractGuardsFromTransition<
  T extends { guards: SingleOrArrayL<GuardConfig> },
> =
  ReduceArray<T['guards']> extends infer R extends GuardConfig
    ? FromGuard<R>
    : never;

/**
 * A {@linkcode _TransitionConfigMap} that requires a target.
 */
export type TransitionConfigMapF = types.Require<
  _TransitionConfigMap,
  'target'
>;

/**
 * A {@linkcode _TransitionConfigMap} that requires actions.
 */
export type TransitionConfigMapA = types.Require<
  _TransitionConfigMap,
  'actions'
>;

/**
 * A better version {@linkcode _TransitionConfigMap}.
 *
 * This type is used to ensure that the transition configuration
 * has either a target or actions defined, but not both.
 *
 * @see {@linkcode TransitionConfigMapF} for a version that requires a target.
 * @see {@linkcode TransitionConfigMapA} for a version that requires actions.
 */
export type TransitionConfigMap =
  | TransitionConfigMapF
  | TransitionConfigMapA;

/**
 * A version {@linkcode TransitionConfigMap} with string declaration.
 */
export type TransitionConfig = string | TransitionConfigMap;

/**
 * A version {@linkcode TransitionConfigMapF} with string declaration.
 */
export type TransitionConfigF = string | TransitionConfigMapF;

/**
 * An array of transitions that can be used in a state machine.
 *
 * More difficult than a simple array of {@linkcode TransitionConfig}
 *
 * @see {@linkcode TransitionConfigMapF} for a version that requires a target.
 * @see {@linkcode TransitionConfigMapA} for a version that requires actions.
 * @see {@linkcode TransitionConfig} for a version that can be a string or a {@linkcode TransitionConfigMap}.
 * @see {@linkcode types.Require}
 */
export type ArrayTransitions = readonly [
  ...(
    | types.Require<TransitionConfigMapF, 'guards'>
    | types.Require<TransitionConfigMapA, 'guards'>
  )[],
  TransitionConfig,
];

/**
 * A type that can be either an array of transitions or a single transition configuration.
 *
 * @see {@linkcode ArrayTransitions} for an array of transitions.
 * @see {@linkcode TransitionConfig} for a single transition configuration.
 */
export type SingleOrArrayT = ArrayTransitions | TransitionConfig;

/**
 * Representation of a always transition config.
 *
 * @see {@linkcode ArrayTransitions} for an array of transitions.
 * @see {@linkcode TransitionConfigF} for a single transition configuration with a target.
 * @see {@linkcode types.Require}
 */
export type AlwaysConfig =
  | readonly [
      ...types.Require<TransitionConfigMap, 'guards'>[],
      TransitionConfigF,
    ]
  | TransitionConfigF;

/**
 * A type used to represent a record of transitions.
 *
 * @remarks For the purpose of delay transition config.
 */
export type DelayedTransitions = RecordS<SingleOrArrayT>;

/**
 * Extracts action keys from a {@linkcode DelayedTransitions}.
 *
 * @template T - The delayed transitions type.
 *
 * @see {@linkcode ExtractActionsFromTransition} for extracting actions from a transition configuration.
 * @see {@linkcode ReduceArray} for reducing arrays to their elements.
 * @see {@linkcode SingleOrArrayL} for handling single or array types.
 * @see {@linkcode ActionConfig} for the structure of action configurations.
 *
 * @see {@linkcode ExtractGuardsFromTransition} for extracting guards from a transition configuration.
 */
export type ExtractActionKeysFromDelayed<T> = ExtractActionsFromTransition<
  Extract<
    ReduceArray<T[keyof T]>,
    { actions: SingleOrArrayL<ActionConfig> }
  >
>;

/**
 * Extracts guards from a {@linkcode DelayedTransitions}.
 *
 * @template T - The delayed transitions type.
 *
 * @see {@linkcode ExtractGuardsFromTransition} for extracting guards from a transition configuration.
 * @see {@linkcode ReduceArray} for reducing arrays to their elements.
 * @see {@linkcode SingleOrArrayL} for handling single or array types.
 * @see {@linkcode GuardConfig} for the structure of guard configurations.
 *
 * @see {@linkcode ExtractActionsFromTransition} for extracting actions from a transition configuration.
 */
export type ExtractGuardKeysFromDelayed<T> = ExtractGuardsFromTransition<
  Extract<ReduceArray<T[keyof T]>, { guards: SingleOrArrayL<GuardConfig> }>
>;

/**
 * Represents a JSON configuration for delayed transitions.
 *
 * @remarks This type is used to define transitions that occur after a delay.
 * It can include actions, guards, and promises.
 *
 * @see {@linkcode DelayedTransitions} for the structure of delayed transitions.
 * @see {@linkcode AlwaysConfig} for always transitions configuration.
 * @see {@linkcode PromiseeConfig} for promise configurations.
 * @see {@linkcode SingleOrArrayL} for handling single or array types.
 */

export type TransitionsConfig = {
  readonly on?: DelayedTransitions;
  readonly always?: AlwaysConfig;
  readonly after?: DelayedTransitions;
  readonly promises?: SingleOrArrayL<PromiseeConfig>;
};

/**
 * Extracts delay keys from a {@linkcode TransitionsConfig}.
 *
 * @template : {@linkcode TransitionsConfig} [T] - The transitions configuration type.
 * @returns The keys of the delays extracted from the transitions configuration.
 *
 * @see {@linkcode ExtractMaxFromPromisee} for extracting the maximum delay from promises.
 * @see {@linkcode ReduceArray} for reducing arrays to their elements.
 * @see {@linkcode Extract} for extracting specific types from a union.
 * @see {@linkcode types.NotUndefined} for ensuring the type is not undefined.
 */
export type ExtractDelayKeysFromTransitions<T extends TransitionsConfig> =
  | ExtractMaxFromPromisee<
      Extract<ReduceArray<T['promises']>, { max: string }>
    >
  | (T['after'] extends undefined ? never : keyof T['after']);

/**
 * Extracts actions keys from a {@linkcode TransitionsConfig}.
 *
 * @template : {@linkcode TransitionsConfig} [T] - The transitions configuration type.
 * @returns The actions keys extracted from the transitions configuration.
 *
 * @see {@linkcode ExtractActionsFromTransition} for extracting actions from a transition configuration.
 * @see {@linkcode ExtractActionsFromDelayed} for extracting actions from delayed transitions.
 * @see {@linkcode ExtractActionsFromPromisee} for extracting actions from promises.
 * @see {@linkcode ReduceArray} for reducing arrays to their elements.
 * @see {@linkcode SingleOrArrayL} for handling single or array types.
 * @see {@linkcode ActionConfig} for the structure of action configurations.
 * @see {@linkcode types.NotUndefined} for ensuring the type is not undefined.
 * @see {@linkcode Extract}
 */
export type ExtractActionKeysFromTransitions<T extends TransitionsConfig> =

    | ExtractActionKeysFromDelayed<T['on']>
    | ExtractActionKeysFromDelayed<T['after']>
    | ExtractActionsFromTransition<
        Extract<
          ReduceArray<T['always']>,
          { actions: SingleOrArrayL<ActionConfig> }
        >
      >
    | ExtractActionsFromPromisee<
        types.NotUndefined<ReduceArray<T['promises']>>
      >;

/**
 * Extracts guard keys from a {@linkcode TransitionsConfig}.
 *
 * @template : {@linkcode TransitionsConfig} [T] - The transitions configuration type.
 * @returns The guard keys extracted from the transitions configuration.
 *
 * @see {@linkcode ExtractGuardsFromTransition} for extracting guards from a transition configuration.
 * @see {@linkcode ExtractGuardKeysFromDelayed} for extracting guards from delayed transitions.
 * @see {@linkcode ExtractGuardsFromPromise} for extracting guards from promises.
 * @see {@linkcode ReduceArray} for reducing arrays to their elements.
 * @see {@linkcode SingleOrArrayL} for handling single or array types.
 * @see {@linkcode GuardConfig} for the structure of guard configurations.
 * @see {@linkcode types.NotUndefined} for ensuring the type is not undefined.
 * @see {@linkcode Extract}
 */
export type ExtractGuardKeysFromTransitions<T extends TransitionsConfig> =
  | ExtractGuardKeysFromDelayed<T['on']>
  | ExtractGuardKeysFromDelayed<T['after']>
  | ExtractGuardsFromTransition<
      Extract<
        ReduceArray<T['always']>,
        { guards: SingleOrArrayL<GuardConfig> }
      >
    >
  | ExtractGuardsFromPromise<
      types.NotUndefined<ReduceArray<T['promises']>>
    >;

/**
 * Extracts source keys from a {@linkcode TransitionsConfig}.
 *
 * @template : {@linkcode TransitionsConfig} [T] - The transitions configuration type.
 * @returns The source keys extracted from the transitions configuration.
 *
 * @see {@linkcode ExtractSrcFromPromisee} for extracting source from promises.
 * @see {@linkcode types.NotUndefined} for ensuring the type is not undefined.
 * @see {@linkcode ReduceArray} for reducing arrays to their elements.
 * */
export type ExtractSrcFromTransitions<T extends TransitionsConfig> =
  ExtractSrcFromPromisee<types.NotUndefined<ReduceArray<T['promises']>>>;

/**
 * Represents a transition in a state machine with full defined functions.
 *
 * @template : {@linkcode EventsMap} [E] - The events map used in the transition.
 * @template : {@linkcode PromiseeMap} [P] - The promisees map used in the transition.
 * @template : [Pc] - The private context type for the transition.
 * @template : {@linkcode types.PrimitiveObject} [Tc] - The context for the transition.
 *
 * @see {@linkcode Action} for the structure of actions in the transition.
 * @see {@linkcode Predicate} for the structure of guards in the transition.
 */
export type Transition<
  E extends EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc extends types.PrimitiveObject = types.PrimitiveObject,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
> = {
  readonly target: string[];
  readonly actions: Action<E, P, Pc, Tc>[];
  readonly guards: Predicate<E, P, Pc, Tc>[];
  readonly description?: string;
  readonly in: string[];
};

/**
 * Represents all transitions inside a state config with full defined functions.
 *
 * @template : {@linkcode EventsMap} [E] - The events map used in the transitions.
 * @template : {@linkcode PromiseeMap} [P] - The promisees map used in the transitions.
 * @template : [Pc] - The private context type for the transitions.
 * @template : {@linkcode types.PrimitiveObject} [Tc] - The context for the transitions
 *
 * @see {@linkcode Transition} for the structure of a single transition.
 * @see {@linkcode Promisee} for the structure of promises in the transitions.
 * @see {@linkcode Identitfy} for identifying properties in the transitions.
 */
export type Transitions<
  E extends EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc extends types.PrimitiveObject = types.PrimitiveObject,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
> = {
  on: Identitfy<Transition<E, P, Pc, Tc>>[];
  always: Transition<E, P, Pc, Tc>[];
  after: Identitfy<Transition<E, P, Pc, Tc>>[];
  promises: Promisee<E, P, Pc, Tc>[];
};
