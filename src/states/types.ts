import type {
  Equals,
  Keys,
  PrimitiveObject,
  SoA,
  UnionToIntersection,
} from '#bemedev/globals/types';
import type { EventObject } from '#events';
import type { FromGuard, GuardConfig } from '#guards';
import type { Transitions, TransitionsConfig } from '#transitions';
import type {
  Action,
  ActionConfig,
  FromActionConfig,
} from 'src/actions/types';
import type {
  Identify,
  RecordS,
  ReduceArray,
  SingleOrArrayL,
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

export type BaseConfig = {
  readonly description?: string;
  readonly entry?: SingleOrArrayL<ActionConfig>;
  readonly exit?: SingleOrArrayL<ActionConfig>;
  readonly tags?: SingleOrArrayL<string>;
  readonly activities?: ActivityConfig;
};

export type CommonNodeConfig<Paths extends string = string> = BaseConfig &
  TransitionsConfig<Paths>;

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

// #region States
export type WorkingStatus =
  | 'idle'
  | 'starting'
  | 'started'
  | 'paused'
  | 'working'
  | 'sending'
  | 'stopped'
  | 'busy';

type _ExtractTagsFromFlat<Flat extends FlatMapN> = {
  [key in keyof Flat]: Flat[key] extends infer S extends {
    tags: SingleOrArrayL<string>;
  }
    ? ReduceArray<S['tags']>
    : never;
}[keyof Flat];

export type ExtractTagsFromFlat<Flat extends FlatMapN> =
  _ExtractTagsFromFlat<Flat> extends infer Tags
    ? Equals<Tags, never> extends true
      ? string
      : Equals<Tags, unknown> extends true
        ? string
        : Tags
    : string;

export type State<
  E extends EventObject = EventObject,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
> = {
  context: Tc;
  status: WorkingStatus;
  value: StateValue;
  event: E;
  tags?: SoA<T>;
};

export type StateP<
  E = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
> = {
  context: Tc;
  status: WorkingStatus;
  value: StateValue;
  payload: E;
  tags?: SoA<T>;
};

export type StateExtended<
  E extends EventObject = EventObject,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
> = {
  pContext: Pc;
} & State<E, Tc, T>;

export type StatePextended<
  E = any,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
> = {
  pContext: Pc;
} & StateP<E, Tc, T>;
// #endregion

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
> = UnionToIntersection<FlatMapNodeConfig<T, withChildren>> & {
  readonly '/': T;
};
// #endregion

type AlwaysEnd = `${string}.always` | `${string}.always.[${number}]`;

export type EndWithAlways<T extends Keys> = Extract<T, AlwaysEnd>;

export type EndwA<T extends Keys> = EndWithAlways<T>;

export type Node<
  E extends EventObject = EventObject,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
> = {
  id?: string;
  description?: string;
  type: StateType;
  entry: Action<E, Pc, Tc, T>[];
  exit: Action<E, Pc, Tc, T>[];
  tags: string[];
  states: Identify<Node<E, Pc, Tc, T>>[];
  initial?: string;
} & Transitions<E, Pc, Tc, T>;
