import type {
  AnyArray,
  Keys,
  NOmit,
  NotUndefined,
  Ru,
  SoA,
  SoRa,
} from '#bemedev/globals/types';
import type { StateValue } from '#states';

type PrimitiveS =
  | 'string'
  | 'number'
  | 'boolean'
  | 'null'
  | 'undefined'
  | 'symbol';
type TransformPrimitiveS<T extends PrimitiveS> = T extends 'string'
  ? string
  : T extends 'number'
    ? number
    : T extends 'boolean'
      ? boolean
      : T extends 'null'
        ? null
        : T extends 'undefined'
          ? undefined
          : T extends 'symbol'
            ? symbol
            : never;

type Types = PrimitiveS | 'primitive';

type TransformTypes<T extends Types> = T extends PrimitiveS
  ? TransformPrimitiveS<T>
  : // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    {};

const transformTypes = <T extends Types>(type: T): TransformTypes<T> => {
  const out: any = type === 'primitive' ? {} : undefined;
  return out;
};

export const CUSTOM = '$$app-ts => custom$$' as const;
export const MAYBE = '$$app-ts => maybe$$' as const;
export const PARTIAL = '$$app-ts => partial$$' as const;
export const ARRAY = '$$app-ts => array$$' as const;

export type Custom<T = any> = {
  [CUSTOM]: T;
};

export type PartialCustom = {
  [PARTIAL]: undefined;
};

type __PrimitiveObject =
  | Types
  | PrimitiveObjectMap
  | Custom
  | PartialCustom;

export type Maybe<
  T extends __PrimitiveObject | ArrayCustom | __PrimitiveObject[] =
    __PrimitiveObject,
> = {
  [MAYBE]: T;
};

export type ArrayCustom<
  T extends __PrimitiveObject | Maybe = __PrimitiveObject,
> = {
  [ARRAY]: T;
};

type PrimitiveObjectMap = {
  [key: Keys]: SoRa<_PrimitiveObject>;
};

type _PrimitiveObject = __PrimitiveObject | Maybe | ArrayCustom;

/**
 * A type that represents a primitive object, which can be a primitive value or an object
 *
 * @remark
 */
export type PrimitiveObjectT = _PrimitiveObject | SoRa<_PrimitiveObject>;
type ActorsMap = Partial<
  Record<'children' | 'promisees' | 'emitters', PrimitiveObjectT>
>;

export type Args<
  E extends PrimitiveObjectT = PrimitiveObjectT,
  P extends ActorsMap = ActorsMap,
> = {
  eventsMap: E;
  pContext: PrimitiveObjectT;
  context: PrimitiveObjectT;
  actorsMap: P;
};

type ReduceTuple2<T extends AnyArray<PrimitiveObjectT>> = T extends [
  infer First,
  ...infer Rest extends AnyArray<PrimitiveObjectT>,
]
  ? [TransformPrimitiveObject<First>, ...ReduceTuple2<Rest>]
  : T extends AnyArray<infer A extends PrimitiveObjectT>
    ? TransformPrimitiveObject<A>[]
    : [];

type __TransformPrimitiveObject<T> = T extends Types
  ? TransformTypes<T>
  : T extends Custom<infer TCustom>
    ? TCustom
    : T extends AnyArray<PrimitiveObjectT>
      ? ReduceTuple2<T>
      : T extends ArrayCustom<infer A>
        ? TransformPrimitiveObject<A>[]
        : T extends PartialCustom
          ? Partial<__TransformPrimitiveObject<NOmit<T, typeof PARTIAL>>>
          : T extends Maybe<infer TMaybe>
            ? __TransformPrimitiveObject<TMaybe> | undefined
            : {
                [K in keyof T]: __TransformPrimitiveObject<T[K]>;
              };

type ReduceTupleU<T extends AnyArray> = T extends [
  infer First,
  ...infer Rest extends AnyArray,
]
  ? [Undefiny<First>, ...ReduceTupleU<Rest>]
  : T[number] extends never
    ? []
    : T['length'] extends 0
      ? []
      : number extends T['length']
        ? T
        : Undefiny<T[number]>[];
type HasUndefined<T> = undefined extends T ? true : false;
type UndefinyObject<T extends object> = {
  [K in keyof T as HasUndefined<T[K]> extends true ? never : K]: Undefiny<
    T[K]
  >;
} & {
  [K in keyof T as HasUndefined<T[K]> extends true ? K : never]?: Undefiny<
    Exclude<T[K], undefined>
  >;
} extends infer F
  ? {
      [K in keyof F]: F[K];
    }
  : never;

type Undefiny<T> = T extends AnyArray
  ? ReduceTupleU<T>
  : T extends Ru
    ? UndefinyObject<T>
    : T;

export type TransformPrimitiveObject<T> = Undefiny<
  __TransformPrimitiveObject<T>
>;

export const transformPrimitiveObject = <T extends PrimitiveObjectT>(
  obj: T,
): TransformPrimitiveObject<T> => {
  const _obj = obj as any;

  const checkArray = Array.isArray(obj);
  if (checkArray) {
    return obj.map(transformPrimitiveObject as any) as any;
  }

  const checkObject = typeof obj === 'object';
  if (checkObject) {
    if (MAYBE in _obj) {
      return transformPrimitiveObject(_obj[MAYBE]);
    }

    const isCustom = Object.keys(obj).every(key => key === CUSTOM);
    const out: any = {};
    if (isCustom) return out;

    const entries = Object.entries(obj).filter(([key]) => key !== PARTIAL);

    entries.forEach(([key, value]) => {
      out[key] = transformPrimitiveObject(value);
    });

    return out;
  }

  return transformTypes(_obj) as any;
};

type UndefinyT<T> = PrimitiveObjectT extends T ? 'undefined' : T;

export type TransformArgs<T extends Partial<Args>> = {
  eventsMap: TransformPrimitiveObject<T['eventsMap']>;
  pContext: TransformPrimitiveObject<UndefinyT<T['pContext']>>;
  context: TransformPrimitiveObject<UndefinyT<T['context']>>;
  actorsMap: {
    children: TransformPrimitiveObject<
      NotUndefined<T['actorsMap']>['children']
    >;
    promisees: TransformPrimitiveObject<
      NotUndefined<T['actorsMap']>['promisees']
    >;
    emitters: TransformPrimitiveObject<
      NotUndefined<T['actorsMap']>['emitters']
    >;
  };
} extends infer TT
  ? {
      [key in keyof TT]: TT[key];
    }
  : never;

const DEFAULT_ARGS = {
  eventsMap: 'primitive',
  pContext: 'undefined',
  context: 'primitive',
  actorsMap: {
    children: 'primitive',
    promisees: 'primitive',
    emitters: 'primitive',
  },
} as const satisfies Args;

const defaultArgs = <const T extends Partial<Args>>(values?: T) => {
  const args = {
    ...DEFAULT_ARGS,
    ...values,
    actorsMap: {
      ...DEFAULT_ARGS.actorsMap,
      ...values?.actorsMap,
    },
  } satisfies Args;
  return args;
};

export const typings = <const T extends Partial<Args>>(
  args?: T,
): TransformArgs<T> => {
  const out = transformPrimitiveObject(defaultArgs(args as any));
  return out as TransformArgs<T>;
};

typings.custom = <T = any>(value?: T) =>
  ({
    [CUSTOM]: value,
  }) as Custom<T>;

typings.record = <const K extends Keys[], V extends PrimitiveObjectT>(
  value: V,
  ...keys: K
) => {
  const object = keys.reduce((acc, key) => {
    acc[key] = value;
    return acc;
  }, {} as any);

  return object as Record<K[number] extends never ? Keys : K[number], V>;
};

typings.any = <T extends PrimitiveObjectT>(value: T) => value;

typings.maybe = <T extends __PrimitiveObject | __PrimitiveObject[]>(
  value?: T,
) =>
  ({
    [MAYBE]: value,
  }) as Maybe<T>;

typings.litterals = <const T extends (string | number | boolean)[]>(
  ...values: T
) => values[0] as unknown as Custom<T[number]>;

typings.union = <
  T extends [PrimitiveObjectT, PrimitiveObjectT, ...PrimitiveObjectT[]],
>(
  ...values: T
) => {
  return values[0] as T[number];
};

typings.array = <T extends __PrimitiveObject | Maybe>(value: T) =>
  ({ [ARRAY]: value }) as ArrayCustom<T>;

typings.tuple = <
  T extends [
    __PrimitiveObject | Maybe | ArrayCustom,
    ...(__PrimitiveObject | Maybe | ArrayCustom)[],
  ],
>(
  ...values: T
) => values;

type Discriminated<K extends Keys> = PrimitiveObjectMap &
  Record<K, PrimitiveObjectT>;

typings.discriminatedUnion = <
  const K extends Keys,
  T extends [Discriminated<K>, Discriminated<K>, ...Discriminated<K>[]],
>(
  _key: K,
  ...values: T
) => {
  return typings.union(...values);
};

type _IntersectionCustom<T extends PrimitiveObjectMap[]> = T extends [
  infer First extends PrimitiveObjectMap,
  ...infer Rest extends PrimitiveObjectMap[],
]
  ? First & IntersectionCustom<Rest>
  : unknown;

export type IntersectionCustom<T extends PrimitiveObjectMap[]> =
  _IntersectionCustom<T> extends infer R
    ? {
        [K in keyof R]: R[K];
      }
    : never;

typings.intersection = <
  T extends [
    PrimitiveObjectMap,
    PrimitiveObjectMap,
    ...PrimitiveObjectMap[],
  ],
>(
  ...values: T
) => {
  const out = values.reduce((acc, curr) => {
    Object.entries(curr).forEach(([key, value]) => {
      acc[key] = value;
    });
    return acc;
  }, {} as any);
  return out as IntersectionCustom<T>;
};

typings.partial = <T extends PrimitiveObjectT>(
  value: T,
): T & PartialCustom => {
  const entries = Object.entries(value).filter(([key]) => key !== PARTIAL);
  const out: any = {};

  entries.forEach(([key, value]) => {
    out[key] = value;
  });

  return out;
};

typings.soa = <T extends PrimitiveObjectT>(value: T) => {
  return value as SoA<T>;
};

typings.sv = {} as Custom<StateValue>;

export type inferT<T extends PrimitiveObjectT> =
  TransformPrimitiveObject<T>;
