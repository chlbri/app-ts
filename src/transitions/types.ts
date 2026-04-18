import type {
  AnyArray,
  IndexesOfArray,
  NotUndefined,
  PrimitiveObject,
  Require,
} from '#bemedev/globals/types';
import type { EventObject } from '#events';
import type { Observable } from 'rxjs';
import type { Action, ActionConfig, FromActionConfig } from '#actions';
import type {
  ActorConfig,
  ChildConfig,
  EmitterConfig,
} from '../actor.types';
import type { FromGuard, GuardConfig, Predicate } from '#guards';

import type { Emitter } from '#emitters';
import type { Child } from '#machines';
import type {
  Identify,
  RecordS,
  ReduceArray,
  SingleOrArrayL,
} from '~types';

/**
 * Represents the simpliest configuration map for a transition.
 * Used as Helper
 */
type _TransitionConfigMap<Paths = string> = {
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
export type ExtractGuardKeysFromTransition<
  T extends { guards: SingleOrArrayL<GuardConfig> },
> =
  ReduceArray<T['guards']> extends infer R extends GuardConfig
    ? FromGuard<R>
    : never;

/**
 * A {@linkcode _TransitionConfigMap} that requires actions.
 */
export type TransitionConfigMapA<Paths = string> = Require<
  _TransitionConfigMap<Paths>,
  'actions'
>;

export type TransitionConfigA<Paths = string> =
  | Require<TransitionConfigMapA<Paths>, 'actions'>
  | Paths;

export type TransitionConfigMapF<Paths = string> = Require<_TransitionConfigMap<Paths>, 'target'>;

export type TransitionConfigF<Paths = string> =
  | Require<TransitionConfigMapF<Paths>, 'target'>
  | Paths;

export type TransitionConfigMap<Paths = string> =
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
export type TransitionConfig<Paths = string> = Paths | TransitionConfigMap<Paths>;

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
export type ArrayTransitions<Paths = string> = readonly [
  ...Require<TransitionConfigMap<Paths>, 'guards'>[],
  TransitionConfig<Paths>,
];

/**
 * A type that can be either an array of transitions or a single transition configuration.
 *
 * @see {@linkcode ArrayTransitions} for an array of transitions.
 * @see {@linkcode TransitionConfig} for a single transition configuration.
 */
export type SingleOrArrayT<Paths = string> = ArrayTransitions<Paths> | TransitionConfig<Paths>;

/**
 * Representation of a always transition config.
 *
 * @see {@linkcode ArrayTransitions} for an array of transitions.
 * @see {@linkcode TransitionConfigF} for a single transition configuration with a target.
 * @see {@linkcode Require}
 */
export type AlwaysConfig<Paths = string> =
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
export type DelayedTransitions<Paths = string> = RecordS<SingleOrArrayT<Paths>>;

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
 * @see {@linkcode ExtractGuardKeysFromTransition} for extracting guards from a transition configuration.
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
 * @see {@linkcode ExtractGuardKeysFromTransition} for extracting guards from a transition configuration.
 * @see {@linkcode ReduceArray} for reducing arrays to their elements.
 * @see {@linkcode SingleOrArrayL} for handling single or array
 * @see {@linkcode GuardConfig} for the structure of guard configurations.
 *
 * @see {@linkcode ExtractActionsFromTransition} for extracting actions from a transition configuration.
 */
export type ExtractGuardKeysFromDelayed<T> =
  ExtractGuardKeysFromTransition<
    Extract<
      ReduceArray<T[keyof T]>,
      { guards: SingleOrArrayL<GuardConfig> }
    >
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

export type TransitionsConfig<Paths = string> = {
  readonly on?: DelayedTransitions<Paths>;
  readonly always?: AlwaysConfig<Paths>;
  readonly after?: DelayedTransitions<Paths>;
  readonly actors?: RecordS<ActorConfig>;
};

export type GetEventKeysFromEmitter<T extends EmitterConfig> =
  GetEventKeysFromDelayed<Pick<T, 'next' | 'error'>>;

export type GetEventKeysFromMachineConfig<T extends ChildConfig> =
  `on.${GetEventKeysFromDelayed<T['on']>}`;

export type GetEventKeysFromActor<T> = T extends EmitterConfig
  ? GetEventKeysFromEmitter<T>
  : T extends ChildConfig
    ? GetEventKeysFromMachineConfig<T>
    : never;

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
  | ('actors' extends keyof T
      ? `${NotUndefined<T['actors']> extends infer TP
          ? `actors.${{
              [key in keyof TP &
                string]: `${key}.${GetEventKeysFromActor<TP[key]>}`;
            }[keyof TP & string]}`
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
  T['after'] extends undefined ? never : keyof T['after'];

type _ExtractActionsFromMap<T> = ExtractActionsFromTransition<
  Extract<
    ReduceArray<NotUndefined<T>>,
    { actions: SingleOrArrayL<ActionConfig> }
  >
>;

/**
 * Extracts actions from the finally part of a completion configuration.
 */
type _ExtractActionsFromFinally<T> =
  ReduceArray<T> extends infer Tr
    ? Tr extends ActionConfig
      ? FromActionConfig<Tr>
      : _ExtractActionsFromMap<Tr>
    : never;

export type ExtractActionKeysFromEmitter<T extends EmitterConfig> =
  | _ExtractActionsFromMap<T['next']>
  | _ExtractActionsFromMap<T['error']>
  | _ExtractActionsFromFinally<NotUndefined<T['complete']>>;

export type ExtractActionKeysFromChild<T extends ChildConfig> =
  ExtractActionKeysFromDelayed<T['on']>;

export type ExtractActionKeysFromActor<T> = T extends EmitterConfig
  ? ExtractActionKeysFromEmitter<T>
  : T extends ChildConfig
    ? ExtractActionKeysFromChild<T>
    : never;
/**
 * Extracts actions keys from a {@linkcode TransitionsConfig}.
 *
 * @template : {@linkcode TransitionsConfig} [T] - The transitions configuration type.
 * @returns The actions keys extracted from the transitions configuration.
 *
 * @see {@linkcode ExtractActionsFromTransition} for extracting actions from a transition configuration.
 * @see {@linkcode ExtractActionsFromDelayed} for extracting actions from delayed transitions.
 * @see {@linkcode ExtractActionKeysFromPromisee} for extracting actions from promises.
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
    | (NotUndefined<T['actors']> extends infer Ta
        ? {
            [K in keyof Ta]: ExtractActionKeysFromActor<Ta[K]>;
          }[keyof Ta]
        : never);

type _ExtractGuardKeysFromMap<T> = ExtractGuardKeysFromTransition<
  Extract<
    ReduceArray<NotUndefined<T>>,
    { guards: SingleOrArrayL<GuardConfig> }
  >
>;

export type ExtractGuardKeysFromEmitter<T extends EmitterConfig> =
  | _ExtractGuardKeysFromMap<T['next']>
  | _ExtractGuardKeysFromMap<T['error']>
  | ExtractGuardKeysFromDelayed<T['complete']>;

export type ExtractGuardsKeysFromChild<T extends ChildConfig> =
  ExtractGuardKeysFromDelayed<T['on']>;

export type ExtractGuardsKeysFromActor<T> = T extends EmitterConfig
  ? ExtractGuardKeysFromEmitter<T>
  : T extends ChildConfig
    ? ExtractGuardsKeysFromChild<T>
    : never;

/**
 * Extracts guard keys from a {@linkcode TransitionsConfig}.
 *
 * @template : {@linkcode TransitionsConfig} [T] - The transitions configuration type.
 * @returns The guard keys extracted from the transitions configuration.
 *
 * @see {@linkcode ExtractGuardKeysFromTransition} for extracting guards from a transition configuration.
 * @see {@linkcode ExtractGuardKeysFromDelayed} for extracting guards from delayed transitions.
 * @see {@linkcode ExtractGuardKeysFromPromisee} for extracting guards from promises.
 * @see {@linkcode ReduceArray} for reducing arrays to their elements.
 * @see {@linkcode SingleOrArrayL} for handling single or array
 * @see {@linkcode GuardConfig} for the structure of guard configurations.
 * @see {@linkcode NotUndefined} for ensuring the type is not undefined.
 * @see {@linkcode Extract}
 */
export type ExtractGuardKeysFromTransitions<T extends TransitionsConfig> =
  | ExtractGuardKeysFromDelayed<T['on']>
  | ExtractGuardKeysFromDelayed<T['after']>
  | ExtractGuardKeysFromTransition<
      Extract<
        ReduceArray<T['always']>,
        { guards: SingleOrArrayL<GuardConfig> }
      >
    >
  | (NotUndefined<T['actors']> extends infer Ta
      ? {
          [K in keyof Ta]: ExtractGuardsKeysFromActor<Ta[K]>;
        }[keyof Ta]
      : never);

export type ExtractSrcKeyFromTransitions<
  T extends TransitionsConfig,
  Filter extends object = object,
  A extends NotUndefined<T['actors']> = NotUndefined<T['actors']>,
> = {
  [K in keyof A]: A[K] extends Filter ? K : never;
}[keyof A];

export type ExtractEmitterSrcKeyFromTransitions<
  T extends TransitionsConfig,
> = ExtractSrcKeyFromTransitions<T, { next: any }>;

export type ExtractChildKeysFromActors<
  T extends NotUndefined<TransitionsConfig['actors']>,
> = {
  [key in keyof T]: T[key] extends infer Tk extends ChildConfig
    ? {
        src: key;
        contexts: NotUndefined<Tk['contexts']>;
        on: keyof NotUndefined<Tk['on']>;
      }
    : never;
}[keyof T];

export type ExtractChildKeysFromTransitions<T extends TransitionsConfig> =
  ExtractChildKeysFromActors<NotUndefined<T['actors']>>;

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
  E extends EventObject = EventObject,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
> = {
  readonly target?: string;
  readonly actions: Action<E, Pc, Tc, T>[];
  readonly guards: Predicate<E, Pc, Tc, T>[];
  readonly description?: string;
};

export type Emiter4<
  E extends EventObject = EventObject,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
> = {
  src: Observable<any>;
  description?: string;
  then: Transition<E, Pc, Tc, T>[];
  catch: Transition<E, Pc, Tc, T>[];
  finally: Transition<E, Pc, Tc, T>[];
};

/**
 * Represents all transitions inside a state config with full defined functions.
 *
 * @template : {@linkcode EventsMap} [E] - The events map used in the transitions.
 * @template : [Pc] - The private context type for the transitions.
 * @template : {@linkcode PrimitiveObject} [Tc] - The context for the transitions
 *
 * @see {@linkcode Transition} for the structure of a single transition.
 * @see {@linkcode Identify} for identifying properties in the transitions.
 */
export type Transitions<
  E extends EventObject = EventObject,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
> = {
  on: Identify<Transition<E, Pc, Tc, T>>[];
  always: Transition<E, Pc, Tc, T>[];
  after: Identify<Transition<E, Pc, Tc, T>>[];
  emitters: Emitter<E, Pc, Tc, T>[];
  children: Child<E, Pc, Tc, T>[];
};
