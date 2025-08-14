import type { Action, ActionConfig, FromActionConfig } from '#actions';
import type { EventsMap, PromiseeMap } from '#events';
import type { FromGuard, GuardConfig } from '#guards';
import type { Transitions, TransitionsConfig } from '#transitions';
import type { types } from '@bemedev/types';
import type {
  Identitfy,
  RecordS,
  ReduceArray,
  SingleOrArrayL,
  SingleOrArrayR,
} from '~types';

export type StateType = 'atomic' | 'compound' | 'parallel';

export type SNC = NodeConfig;

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

export type CommonNodeConfig<Paths extends string = string> = {
  readonly description?: string;
  readonly entry?: SingleOrArrayR<ActionConfig>;
  readonly exit?: SingleOrArrayR<ActionConfig>;
  readonly tags?: SingleOrArrayR<string>;
  readonly activities?: ActivityConfig;
} & TransitionsConfig<Paths>;

export type NodeConfig<
  Paths extends string = string,
  I extends string = string,
> = CommonNodeConfig<Paths> &
  (
    | {
        readonly type?: 'atomic';
        readonly initial?: never;
        readonly states?: never;
      }
    | {
        readonly type?: 'compound';
        readonly initial: I;
        readonly states: RecordS<NodeConfig>;
      }
    | {
        readonly type: 'parallel';
        readonly initial?: never;
        readonly states: RecordS<NodeConfig>;
      }
  );

export type NodeConfigAtomic<Paths extends string = string> =
  CommonNodeConfig<Paths> & {
    readonly type?: 'atomic';
    readonly initial?: never;
    readonly states?: never;
  };

export type NodeConfigCompound<
  Paths extends string = string,
  I extends string = string,
> = CommonNodeConfig<Paths> & {
  readonly type?: 'compound';
  readonly initial: I;
  readonly states: RecordS<NodeConfig>;
};

export type NodeConfigParallel<Paths extends string = string> =
  CommonNodeConfig<Paths> & {
    readonly type: 'parallel';
    readonly initial?: never;
    readonly states: RecordS<NodeConfig>;
  };

export type StateValue = string | StateValueMap;

export interface StateValueMap {
  [key: string]: StateValue;
}

// #region Flat

type FlatMapNodeConfig<
  T extends NodeConfig,
  withChildren extends boolean = true,
  Remaining extends string = '/',
> = 'states' extends keyof T
  ? {
      readonly [key in keyof T['states'] as `${Remaining}${key & string}`]: withChildren extends true
        ? T['states'][key]
        : Omit<T['states'][key], 'states'>;
    } & {
      [key in keyof T['states']]: T['states'][key] extends infer S extends
        NodeConfig & {
          states: RecordS<NodeConfig>;
        }
        ? FlatMapNodeConfig<
            S,
            withChildren,
            `${Remaining}${key & string}/`
          >
        : // eslint-disable-next-line @typescript-eslint/no-empty-object-type
          {};
    }[keyof T['states']]
  : // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    {};

export type FlatMapN<
  T extends NodeConfig = NodeConfig,
  withChildren extends boolean = true,
> = types.UnionToIntersection<FlatMapNodeConfig<T, withChildren>> & {
  readonly '/': T;
};
// #endregion

type AlwaysEnd = `${string}.always` | `${string}.always.[${number}]`;

export type EndWithAlways<T extends types.Keys> = Extract<T, AlwaysEnd>;

export type EndwA<T extends types.Keys> = EndWithAlways<T>;

export type Node<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
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
