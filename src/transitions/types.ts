import type { NotUndefined, Require } from '@bemedev/types';
import type { Action, ActionConfig, FromActionConfig } from '~actions';
import type { EventsMap } from '~events';
import type { FromGuard, GuardConfig, Predicate } from '~guards';
import type {
  ExtractActionsFromPromise,
  ExtractGuardsFromPromise,
  ExtractMaxFromPromise,
  ExtractSrcFromPromise,
  PromiseConfig,
  Promisee,
} from '~promises';
import type {
  Identitfy,
  PrimitiveObject,
  RecordS,
  ReduceArray,
  SingleOrArrayL,
} from '~types';

type _TransitionConfigMap = {
  readonly target?: string;
  // readonly internal?: boolean;
  readonly actions?: SingleOrArrayL<ActionConfig>;
  readonly guards?: SingleOrArrayL<GuardConfig>;
  readonly description?: string;
};

export type ExtractActionsFromMap<
  T extends { actions: SingleOrArrayL<ActionConfig> },
> =
  ReduceArray<T['actions']> extends infer R extends ActionConfig
    ? FromActionConfig<R>
    : never;

export type ExtractGuardsFromMap<
  T extends { guards: SingleOrArrayL<GuardConfig> },
> =
  ReduceArray<T['guards']> extends infer R extends GuardConfig
    ? FromGuard<R>
    : never;

export type TransitionConfigMapF = Require<_TransitionConfigMap, 'target'>;
export type TransitionConfigMapA = Require<
  _TransitionConfigMap,
  'actions'
>;

export type TransitionConfigMap =
  | TransitionConfigMapF
  | TransitionConfigMapA;

export type TransitionConfig = string | TransitionConfigMap;

export type TransitionConfigF = string | TransitionConfigMapF;

export type ArrayTransitions = readonly [
  ...(
    | Require<TransitionConfigMapF, 'guards'>
    | Require<TransitionConfigMapA, 'guards'>
  )[],
  TransitionConfig,
];

export type SingleOrArrayT = ArrayTransitions | TransitionConfig;

export type ThenNext = TransitionConfigMapF | TransitionConfigMapA;

export type AlwaysConfig =
  | readonly [
      ...Require<TransitionConfigMap, 'guards'>[],
      TransitionConfigF,
    ]
  | TransitionConfigF;

export type DelayedTransitions = RecordS<SingleOrArrayT>;

export type ExtractActionsFromDelayed<T> = ExtractActionsFromMap<
  Extract<T[keyof T], { actions: SingleOrArrayL<ActionConfig> }>
>;

export type ExtractGuardsFromDelayed<T> = ExtractGuardsFromMap<
  Extract<T[keyof T], { guards: SingleOrArrayL<GuardConfig> }>
>;

export type TransitionsConfig = {
  readonly on?: DelayedTransitions;
  readonly always?: AlwaysConfig;
  readonly after?: DelayedTransitions;
  readonly promises?: SingleOrArrayL<PromiseConfig>;
};

export type ExtractDelaysFromTransitions<T extends TransitionsConfig> =
  | ExtractMaxFromPromise<
      Extract<ReduceArray<T['promises']>, { max: string }>
    >
  | (T['after'] extends undefined ? never : keyof T['after']);

export type ExtractActionsFromTransitions<T extends TransitionsConfig> =
  | ExtractActionsFromDelayed<T['on']>
  | ExtractActionsFromDelayed<T['after']>
  | ExtractActionsFromMap<
      Extract<
        ReduceArray<T['always']>,
        { actions: SingleOrArrayL<ActionConfig> }
      >
    >
  | ExtractActionsFromPromise<NotUndefined<ReduceArray<T['promises']>>>;

export type ExtractGuardsFromTransitions<T extends TransitionsConfig> =
  | ExtractGuardsFromDelayed<T['on']>
  | ExtractGuardsFromDelayed<T['after']>
  | ExtractGuardsFromMap<
      Extract<
        ReduceArray<T['always']>,
        { guards: SingleOrArrayL<GuardConfig> }
      >
    >
  | ExtractGuardsFromPromise<NotUndefined<ReduceArray<T['promises']>>>;

export type ExtractSrcFromTransitions<T extends TransitionsConfig> =
  ExtractSrcFromPromise<NotUndefined<ReduceArray<T['promises']>>>;

export type _ExtractTargetsFromConfig<T extends AlwaysConfig> = T extends {
  target: string;
}
  ? T['target']
  : T;

export type ExtractTargetsFromConfig<T> = _ExtractTargetsFromConfig<
  Extract<ReduceArray<T>, AlwaysConfig>
>;

export type Transition<
  E extends EventsMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = {
  readonly target: string[];
  // readonly internal?: boolean;
  readonly actions: Action<E, Pc, Tc>[];
  readonly guards: Predicate<E, Pc, Tc>[];
  readonly description?: string;
  readonly in: string[];
};

export type Transitions<
  E extends EventsMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = {
  on: Identitfy<Transition<E, Pc, Tc>>[];
  always: Transition<E, Pc, Tc>[];
  after: Identitfy<Transition<E, Pc, Tc>>[];
  promises: Promisee<E, Pc, Tc>[];
};
