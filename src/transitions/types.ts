import type { NotUndefined, Require } from '@bemedev/types';
import type { RecordS } from 'src/machine/types';
import type {
  Identitfy,
  PrimitiveObject,
  ReduceArray,
  SingleOrArrayL,
} from 'src/types/primitives';
import type { Action, ActionConfig, FromActionConfig } from '~actions';
import type { MachineOptions } from '~config';
import type { EventObject } from '~events';
import type { FromGuard, GuardConfig, Predicate } from '~guards';
import type {
  ExtractActionsFromPromise,
  ExtractGuardsFromPromise,
  ExtractMaxFromPromise,
  ExtractSrcFromPromise,
  PromiseConfig,
  Promisee,
} from '~promises';

type _TransitionConfigMap = {
  readonly target?: string;
  // readonly internal?: boolean;
  readonly actions?: SingleOrArrayL<ActionConfig>;
  readonly guards?: SingleOrArrayL<GuardConfig>;
  readonly description?: string;
};

type _ExtractActionsFromMap<
  T extends { actions: SingleOrArrayL<ActionConfig> },
> =
  ReduceArray<T['actions']> extends infer R extends ActionConfig
    ? FromActionConfig<R>
    : never;

type _ExtractGuardsFromMap<
  T extends { guards: SingleOrArrayL<GuardConfig> },
> =
  ReduceArray<T['guards']> extends infer R extends ActionConfig
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

export type ExtractActionsFromDelayed<T> = _ExtractActionsFromMap<
  Extract<T[keyof T], { actions: SingleOrArrayL<ActionConfig> }>
>;

export type ExtractGuardsFromDelayed<T> = _ExtractGuardsFromMap<
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
  | _ExtractActionsFromMap<
      Extract<
        ReduceArray<T['always']>,
        { actions: SingleOrArrayL<ActionConfig> }
      >
    >
  | ExtractActionsFromPromise<NotUndefined<ReduceArray<T['promises']>>>;

export type ExtractGuardsFromTransitions<T extends TransitionsConfig> =
  | ExtractGuardsFromDelayed<T['on']>
  | ExtractGuardsFromDelayed<T['after']>
  | _ExtractGuardsFromMap<
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
  Pc = any,
  TC extends PrimitiveObject = PrimitiveObject,
  TE extends EventObject = EventObject,
> = {
  readonly target: string[];
  // readonly internal?: boolean;
  readonly actions: Action<Pc, TC, TE>[];
  readonly guards: Predicate<Pc, TC, TE>[];
  readonly description?: string;
  readonly in: string[];
};

export type ToTransition_F = <
  TC extends PrimitiveObject,
  TE extends EventObject = EventObject,
>(
  transition: TransitionConfig,
  options?: Pick<MachineOptions<TC, TE>, 'guards' | 'actions'>,
  strict?: boolean,
) => Transition<TC, TE>;

export type Transitions<
  TC extends PrimitiveObject,
  TE extends EventObject = EventObject,
> = {
  on: Identitfy<Transition<TC, TE>>[];
  always: Transition<TC, TE>[];
  after: Identitfy<Transition<TC, TE>>[];
  promises: Promisee<TC, TE>[];
};
