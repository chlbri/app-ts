import type { types } from '@bemedev/types';
import type { Action, ActionConfig, FromActionConfig } from '~actions';
import type { EventsMap, PromiseeMap } from '~events';
import type { FromGuard, GuardConfig } from '~guards';
import type { Decompose3 } from '~machines';
import type { Transitions, TransitionsConfig } from '~transitions';
import type {
  Identitfy,
  ReduceArray,
  SingleOrArrayL,
  SingleOrArrayR,
} from '~types';

export type StateType = 'atomic' | 'compound' | 'parallel';

export type NodeConfig =
  | NodeConfigAtomic
  | NodeConfigCompound
  | NodeConfigParallel;

export type NodeConfigWithInitials =
  | NodeConfigAtomic
  | NodeConfigCompoundWithInitials
  | NodeConfigParallelWithInitials;

export type SNC = NodeConfig;

export type NodesConfig = Record<string, NodeConfig>;

export type NodesConfigWithInitials = Record<
  string,
  NodeConfigWithInitials
>;

export type ActivityMap =
  | {
      guards: SingleOrArrayL<GuardConfig>;
      actions: SingleOrArrayL<ActionConfig>;
    }
  | ActionConfig;

export type ActivityArray = SingleOrArrayL<ActivityMap>;

export type ActivityConfig = Record<string, ActivityArray>;

export type ActionsFromActivity<TS extends ActivityArray> = TS extends any
  ? ReduceArray<TS> extends infer TR
    ? TR extends { actions: SingleOrArrayL<ActionConfig> }
      ? FromGuard<ReduceArray<TR['actions']>>
      : FromActionConfig<ReduceArray<Extract<TR, ActionConfig>>>
    : never
  : never;

export type GuardsFromActivity<TS extends ActivityArray> = TS extends any
  ? ReduceArray<TS> extends infer TR
    ? TR extends { guards: SingleOrArrayL<GuardConfig> }
      ? FromGuard<ReduceArray<TR['guards']>>
      : never
    : never
  : never;

export type ExtractActionsFromActivity<
  T extends { activities: ActivityConfig },
> = T['activities'] extends infer TA extends ActivityConfig
  ? { [key in keyof TA]: ActionsFromActivity<TA[key]> }[keyof TA]
  : never;

export type ExtractGuardsFromActivity<
  T extends { activities: ActivityConfig },
> = T['activities'] extends infer TA extends ActivityConfig
  ? { [key in keyof TA]: GuardsFromActivity<TA[key]> }[keyof TA]
  : never;

export type ExtractDelaysFromActivity<T> = 'activities' extends keyof T
  ? T['activities'] extends infer TA extends ActivityConfig
    ? TA extends any
      ? keyof TA
      : never
    : never
  : never;

export type CommonNodeConfig = {
  readonly description?: string;
  readonly entry?: SingleOrArrayR<ActionConfig>;
  readonly exit?: SingleOrArrayR<ActionConfig>;
  readonly tags?: SingleOrArrayR<string>;
  readonly activities?: ActivityConfig;
};

export type NodeConfigAtomic = TransitionsConfig &
  CommonNodeConfig & {
    readonly type?: 'atomic';
    readonly initial?: never;
    readonly states?: never;
  };

export type NodeConfigCompound = TransitionsConfig &
  CommonNodeConfig & {
    readonly type?: 'compound';
    readonly initial?: never;
    readonly states: NodesConfig;
  };

export type NodeConfigCompoundWithInitials = TransitionsConfig &
  CommonNodeConfig & {
    readonly initial: string;
    readonly type?: 'compound';
    readonly states: NodesConfigWithInitials;
  };

export type NodeConfigParallel = TransitionsConfig &
  CommonNodeConfig & {
    readonly type: 'parallel';
    readonly states: NodesConfig;
  };

export type NodeConfigParallelWithInitials = TransitionsConfig &
  CommonNodeConfig & {
    readonly type: 'parallel';
    readonly initial?: never;
    readonly states: NodesConfigWithInitials;
  };

export type StateValue = string | StateValueMap;

export interface StateValueMap {
  [key: string]: StateValue;
}

export type LowPick<P, K extends string> = types.NotSubType<
  {
    [key in K]: key extends keyof P ? P[key] : never;
  },
  never
>;

// #region Flat

export type ExcludeS<
  S extends string,
  T extends string,
  D extends string = '/',
> = S extends `${infer P}${T}${D}${infer R}`
  ? `${P extends `${infer P}${D}` ? ExcludeS<P, T> : ExcludeS<P, T>}/${ExcludeS<R, T>}`
  : S;

// #region Flat

export type FlatMapN<
  T extends NodeConfig = NodeConfig,
  wc extends boolean = true,
> =
  types.SubType<
    Decompose3<T, { parent: wc; sep: '/' }>,
    NodeConfig
  > extends infer D
    ? Readonly<
        {
          [key in keyof D as ExcludeS<
            key & string,
            'states',
            '/'
          >]: D[key];
        } & {
          '/': T;
        }
      >
    : never;
// #endregion

export type Node<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc extends types.PrimitiveObject = types.PrimitiveObject,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
> = {
  id?: string;
  description?: string;
  type: StateType;
  entry: Action<E, P, Pc, Tc>[];
  exit: Action<E, P, Pc, Tc>[];
  tags: string[];
  states: Identitfy<Node<E, P, Pc, Tc>>[];
  initial?: string;
} & Transitions<E, P, Pc, Tc>;
