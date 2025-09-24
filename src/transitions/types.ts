import type { Action, ActionConfig, FromActionConfig } from '#actions';
import type {
  AnyArray,
  IndexesOfArray,
  NotUndefined,
  PrimitiveObject,
  Require,
} from '#bemedev/globals/types';
import type { EventsMap, PromiseeMap } from '#events';
import type { FromGuard, GuardConfig, Predicate } from '#guards';
import type {
  ExtractActionsFromPromisee,
  ExtractGuardsFromPromise,
  ExtractMaxFromPromisee,
  ExtractSrcFromPromisee,
  GetEventKeysFromPromisee,
  Promisee,
  PromiseeConfig,
} from '#promises';

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
type _TransitionConfigMap<Paths extends string = string> = {
  readonly target?: Paths;
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
 * @see {@linkcode SingleOrArrayL} for handling single or array
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
 * @see {@linkcode SingleOrArrayL} for handling single or array
 */
export type ExtractGuardsFromTransition<
  T extends { guards: SingleOrArrayL<GuardConfig> },
> =
  ReduceArray<T['guards']> extends infer R extends GuardConfig
    ? FromGuard<R>
    : never;

/**
 * A {@linkcode _TransitionConfigMap} that requires actions.
 */
export type TransitionConfigMapA<Paths extends string = string> = Require<
  _TransitionConfigMap<Paths>,
  'actions'
>;

export type TransitionConfigA<Paths extends string = string> =
  | Require<TransitionConfigMapA<Paths>, 'actions'>
  | Paths;

export type TransitionConfigMapF<Paths extends string = string> = Require<
  _TransitionConfigMap<Paths>,
  'target'
>;

export type TransitionConfigF<Paths extends string = string> =
  | Require<TransitionConfigMapF<Paths>, 'target'>
  | Paths;

export type TransitionConfigMap<Paths extends string = string> =
  | TransitionConfigMapF<Paths>
  | TransitionConfigMapA<Paths>;

/**
 * A better version {@linkcode _TransitionConfigMap}.
 *
 * This type is used to ensure that the transition configuration
 * has either a target or actions defined, but not both.
 *
 * @see {@linkcode TransitionConfigMapF} for a version that requires a target.
 * @see {@linkcode TransitionConfigMapA} for a version that requires actions.
 */
export type TransitionConfig<Paths extends string = string> =
  | Paths
  | TransitionConfigMap<Paths>;

/**
 * A version {@linkcode TransitionConfig} with string declaration.
 */

/**
 * An array of transitions that can be used in a state machine.
 *
 * More difficult than a simple array of {@linkcode TransitionConfig}
 *
 * @see {@linkcode TransitionConfigMapF} for a version that requires a target.
 * @see {@linkcode TransitionConfigMapA} for a version that requires actions.
 * @see {@linkcode TransitionConfig} for a version that can be a string or a {@linkcode TransitionConfig}.
 * @see {@linkcode Require}
 */
export type ArrayTransitions<Paths extends string = string> = readonly [
  ...Require<TransitionConfigMap<Paths>, 'guards'>[],
  TransitionConfig<Paths>,
];

/**
 * A type that can be either an array of transitions or a single transition configuration.
 *
 * @see {@linkcode ArrayTransitions} for an array of transitions.
 * @see {@linkcode TransitionConfig} for a single transition configuration.
 */
export type SingleOrArrayT<Paths extends string = string> =
  | ArrayTransitions<Paths>
  | TransitionConfig<Paths>;

/**
 * Representation of a always transition config.
 *
 * @see {@linkcode ArrayTransitions} for an array of transitions.
 * @see {@linkcode TransitionConfigF} for a single transition configuration with a target.
 * @see {@linkcode Require}
 */
export type AlwaysConfig<Paths extends string = string> =
  | readonly [
      ...Require<TransitionConfigMapF<Paths>, 'guards'>[],
      TransitionConfigF<Paths>,
    ]
  | TransitionConfigF<Paths>;

/**
 * A type used to represent a record of transitions.
 *
 * @remarks For the purpose of delay transition config.
 */
export type DelayedTransitions<Paths extends string = string> = RecordS<
  SingleOrArrayT<Paths>
>;

export type GetEventKeysFromDelayed<T> = {
  [key in keyof T & string]: T[key] extends AnyArray
    ? `${key}.[${IndexesOfArray<T[key]>}]`
    : key;
}[keyof T & string];

/**
 * Extracts action keys from a {@linkcode DelayedTransitions}.
 *
 * @template T - The delayed transitions type.
 *
 * @see {@linkcode ExtractActionsFromTransition} for extracting actions from a transition configuration.
 * @see {@linkcode ReduceArray} for reducing arrays to their elements.
 * @see {@linkcode SingleOrArrayL} for handling single or array
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
 * @see {@linkcode SingleOrArrayL} for handling single or array
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
 * @see {@linkcode SingleOrArrayL} for handling single or array
 */

export type TransitionsConfig<Paths extends string = string> = {
  readonly on?: DelayedTransitions<Paths>;
  readonly always?: AlwaysConfig<Paths>;
  readonly after?: DelayedTransitions<Paths>;
  readonly promises?: SingleOrArrayL<PromiseeConfig<Paths>>;
};

export type GetEventKeysFromTransitions<T> =
  | ('on' extends keyof T
      ? `on.${GetEventKeysFromDelayed<NotUndefined<T['on']>>}`
      : never)
  | ('after' extends keyof T
      ? `after.${GetEventKeysFromDelayed<NotUndefined<T['after']>>}`
      : never)
  | ('always' extends keyof T
      ? T['always'] extends infer TA extends AnyArray
        ? `always.[${IndexesOfArray<TA>}]`
        : 'always'
      : never)
  | ('promises' extends keyof T
      ? `${NotUndefined<T['promises']> extends infer TP
          ? TP extends AnyArray
            ? `promises.${{
                [key in keyof TP &
                  string]: `[${key}].${GetEventKeysFromPromisee<Extract<TP[key], PromiseeConfig>>}`;
              }[keyof TP & string]}`
            : `promises.${GetEventKeysFromPromisee<Extract<TP, PromiseeConfig>>}`
          : never}`
      : never);

/**
 * Extracts delay keys from a {@linkcode TransitionsConfig}.
 *
 * @template : {@linkcode TransitionsConfig} [T] - The transitions configuration type.
 * @returns The keys of the delays extracted from the transitions configuration.
 *
 * @see {@linkcode ExtractMaxFromPromisee} for extracting the maximum delay from promises.
 * @see {@linkcode ReduceArray} for reducing arrays to their elements.
 * @see {@linkcode Extract} for extracting specific types from a union.
 * @see {@linkcode NotUndefined} for ensuring the type is not undefined.
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
 * @see {@linkcode SingleOrArrayL} for handling single or array
 * @see {@linkcode ActionConfig} for the structure of action configurations.
 * @see {@linkcode NotUndefined} for ensuring the type is not undefined.
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
    | ExtractActionsFromPromisee<NotUndefined<ReduceArray<T['promises']>>>;

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
 * @see {@linkcode SingleOrArrayL} for handling single or array
 * @see {@linkcode GuardConfig} for the structure of guard configurations.
 * @see {@linkcode NotUndefined} for ensuring the type is not undefined.
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
  | ExtractGuardsFromPromise<NotUndefined<ReduceArray<T['promises']>>>;

/**
 * Extracts source keys from a {@linkcode TransitionsConfig}.
 *
 * @template : {@linkcode TransitionsConfig} [T] - The transitions configuration type.
 * @returns The source keys extracted from the transitions configuration.
 *
 * @see {@linkcode ExtractSrcFromPromisee} for extracting source from promises.
 * @see {@linkcode NotUndefined} for ensuring the type is not undefined.
 * @see {@linkcode ReduceArray} for reducing arrays to their elements.
 * */
export type ExtractSrcFromTransitions<T extends TransitionsConfig> =
  ExtractSrcFromPromisee<NotUndefined<ReduceArray<T['promises']>>>;

/**
 * Represents a transition in a state machine with full defined functions.
 *
 * @template : {@linkcode EventsMap} [E] - The events map used in the transition.
 * @template : {@linkcode PromiseeMap} [P] - The promisees map used in the transition.
 * @template : [Pc] - The private context type for the transition.
 * @template : {@linkcode types} [Tc] - The context for the transition.
 *
 * @see {@linkcode Action} for the structure of actions in the transition.
 * @see {@linkcode Predicate} for the structure of guards in the transition.
 */
export type Transition<
  E extends EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = {
  readonly target: string;
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
 * @template : {@linkcode PrimitiveObject} [Tc] - The context for the transitions
 *
 * @see {@linkcode Transition} for the structure of a single transition.
 * @see {@linkcode Promisee} for the structure of promises in the transitions.
 * @see {@linkcode Identitfy} for identifying properties in the transitions.
 */
export type Transitions<
  E extends EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = {
  on: Identitfy<Transition<E, P, Pc, Tc>>[];
  always: Transition<E, P, Pc, Tc>[];
  after: Identitfy<Transition<E, P, Pc, Tc>>[];
  promises: Promisee<E, P, Pc, Tc>[];
};
