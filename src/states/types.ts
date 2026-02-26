import type {
  Keys,
  NotUndefined,
  PrimitiveObject,
  SoA,
  UnionToIntersection,
} from '#bemedev/globals/types';
import type {
  _EventsR,
  ActorsConfigMap,
  AllEvent,
  EventsMap,
} from '#events';
import type { FromGuard, GuardConfig } from '#guards';
import type { Transitions, TransitionsConfig } from '#transitions';
import type {
  Action,
  ActionConfig,
  FromActionConfig,
} from 'src/actions/types2';
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

export type State<
  Tc extends PrimitiveObject = PrimitiveObject,
  E extends AllEvent = AllEvent,
  A extends ActorsConfigMap = ActorsConfigMap,
  C extends NotUndefined<A['children']> = NotUndefined<A['children']>,
> = {
  context: Tc;
  status: WorkingStatus;
  value: StateValue;
  event: E;
  tags?: SoA<string>;
  children: {
    [key in keyof C]: {
      context: any;
      status: WorkingStatus;
      value: StateValue;
      event: _EventsR<C[key]>;
      tags?: SoA<string>;
    };
  };
};

export type StateP<
  Tc extends PrimitiveObject = PrimitiveObject,
  E = any,
  A extends ActorsConfigMap = ActorsConfigMap,
  C extends NotUndefined<A['children']> = NotUndefined<A['children']>,
> = {
  context: Tc;
  status: WorkingStatus;
  value: StateValue;
  payload: E;
  tags?: string | readonly string[];
  children: {
    [key in keyof C]: {
      context: any;
      status: WorkingStatus;
      value: StateValue;
      event: _EventsR<C[key]>;
      tags?: SoA<string>;
    };
  };
};

export type StateExtended<
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  E extends AllEvent = AllEvent,
  A extends ActorsConfigMap = ActorsConfigMap,
> = {
  pContext: Pc;
} & State<Tc, E, A>;

export type StatePextended<
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  E = any,
  A extends ActorsConfigMap = ActorsConfigMap,
> = {
  pContext: Pc;
} & StateP<Tc, E, A>;
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
  E extends EventsMap = EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = {
  id?: string;
  description?: string;
  type: StateType;
  entry: Action<E, A, Pc, Tc>[];
  exit: Action<E, A, Pc, Tc>[];
  tags: string[];
  states: Identify<Node<E, A, Pc, Tc>>[];
  initial?: string;
} & Transitions<E, A, Pc, Tc>;
