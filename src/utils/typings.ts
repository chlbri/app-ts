import type {
  AnyArray,
  Equals,
  Keys,
  NotUndefined,
  PrimitiveObject,
  Ru,
  SoA,
  SoRa,
} from '#bemedev/globals/types';
import type { StateValue } from '#states';
import type { EmptyObject } from '@bemedev/decompose';

type PrimitiveS =
  | 'string'
  | 'number'
  | 'boolean'
  | 'void'
  | 'null'
  | 'undefined'
  | 'symbol';

type TransformPrimitiveS<T extends PrimitiveS> = T extends 'string'
  ? string
  : T extends 'number'
    ? number
    : T extends 'void'
      ? void
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
export const OPTIONAL = '$$app-ts => maybe$$' as const;
export const PARTIAL = '$$app-ts => partial$$' as const;
export const ARRAY = '$$app-ts => array$$' as const;

export type Custom<T = any> = {
  [CUSTOM]: T;
};

export type PartialCustom<T extends ObjectMap = EmptyObject> = {
  [PARTIAL]: undefined;
} & T;

type __PrimitiveObject = Types | ObjectMap | Custom | PartialCustom;

export type Optional<
  T extends __PrimitiveObject | ArrayCustom | __PrimitiveObject[] =
    __PrimitiveObject,
> = {
  [OPTIONAL]: T;
};

export type ArrayCustom<
  T extends __PrimitiveObject | Optional | ArrayCustom = __PrimitiveObject,
> = {
  [ARRAY]: T;
};

type ObjectMap = {
  [key: Keys]: _PrimitiveObject;
};

type _PrimitiveObject = __PrimitiveObject | Optional | ArrayCustom;

export type PrimitiveObjectT =
  | Types
  | ArrayCustom<Types>
  | Optional<Types>
  | PrimitiveObjectMapT
  | PartialCustom<Omit<PrimitiveObjectMapT, typeof PARTIAL>>;
export interface PrimitiveObjectMapT {
  [key: Keys]: PrimitiveObjectT;
}

/**
 * A type that represents a primitive object, which can be a primitive value or an object
 *
 * @remark
 */
export type ObjectT = _PrimitiveObject;
export type ActorsMapT<
  P extends string = string,
  E extends string = string,
> = {
  children?: Record<P, PrimitiveObjectT>;
  emitters?: Record<
    E,
    {
      next: PrimitiveObjectT;
      error: PrimitiveObjectT;
    }
  >;
};
export type Args<
  E extends PrimitiveObjectMapT = PrimitiveObjectMapT,
  P extends ActorsMapT = ActorsMapT,
> = {
  eventsMap: E;
  pContext: ObjectT;
  context: ObjectT;
  actorsMap: P;
};

type ReduceTuple2<T extends AnyArray<ObjectT>> = T extends [
  infer First extends ObjectT,
  ...infer Rest extends AnyArray<ObjectT>,
]
  ? [TransformObject<First>, ...ReduceTuple2<Rest>]
  : T extends AnyArray<infer A extends ObjectT>
    ? TransformObject<A>[]
    : [];

type __TransformPrimitiveObject<T> = T extends Types
  ? TransformTypes<T>
  : T extends Custom<infer TCustom>
    ? TCustom
    : T extends AnyArray<ObjectT>
      ? ReduceTuple2<T>
      : T extends ArrayCustom<infer A>
        ? TransformObject<A>[]
        : T extends PartialCustom<infer U>
          ? Partial<__TransformPrimitiveObject<U>>
          : T extends Optional<infer TMaybe>
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

type HasUndefined<T> =
  Equals<void, T> extends true
    ? false
    : undefined extends T
      ? true
      : false;

type UndefinyObject<T extends object> = {
  [K in keyof T as HasUndefined<T[K]> extends true ? never : K]: Undefiny<
    T[K]
  >;
} & {
  [K in keyof T as HasUndefined<T[K]> extends true ? K : never]?: Undefiny<
    Exclude<T[K], undefined>
  >;
};

type Undefiny<T> = T extends AnyArray
  ? ReduceTupleU<T>
  : T extends Ru
    ? UndefinyObject<T>
    : T;

export type TransformObject<T extends ObjectT> = Undefiny<
  __TransformPrimitiveObject<T>
>;

export type TransformPrimitiveObject<T extends PrimitiveObjectT> =
  TransformObject<T> extends infer U extends PrimitiveObject ? U : never;

export const transformPrimitiveObject = <T extends ObjectT>(
  obj: T,
): TransformObject<T> => {
  const _obj = obj as any;

  const checkArray = Array.isArray(obj);
  if (checkArray) {
    return obj.map(transformPrimitiveObject as any) as any;
  }

  const checkObject = typeof obj === 'object';
  if (checkObject) {
    if (OPTIONAL in _obj) {
      const d = _obj[OPTIONAL] as ObjectT;
      return transformPrimitiveObject(d as ObjectT);
    }

    const isCustom = Object.keys(obj).every(key => key === CUSTOM);
    const out: any = {};
    if (isCustom) return out;

    const entries = Object.entries(obj).filter(([key]) => key !== PARTIAL);

    entries.forEach(([key, value]) => {
      out[key] = transformPrimitiveObject(value as ObjectT);
    });

    return out;
  }

  return transformTypes(_obj) as any;
};

export const transform = transformPrimitiveObject;

type UndefinyT<T> = ObjectT extends T ? 'undefined' : T;

export type TransformArgs<T extends Partial<Args>> = {
  eventsMap: TransformPrimitiveObject<NotUndefined<T['eventsMap']>>;
  pContext: TransformObject<NotUndefined<UndefinyT<T['pContext']>>>;
  context: TransformObject<NotUndefined<UndefinyT<T['context']>>>;
  actorsMap: {
    children: TransformObject<NotUndefined<T['actorsMap']>['children']>;

    emitters: TransformObject<NotUndefined<T['actorsMap']>['emitters']>;
  };
} extends infer TT
  ? {
      [key in keyof TT]: TT[key];
    }
  : never;

const DEFAULT_ARGS = {
  eventsMap: {},
  pContext: 'undefined',
  context: 'primitive',
  actorsMap: {
    children: {},
    emitters: {},
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
  const out = transformPrimitiveObject(defaultArgs(args) as ObjectT);
  return out as TransformArgs<T>;
};

typings.custom = <T = any>(value?: T) =>
  ({
    [CUSTOM]: value,
  }) as Custom<T>;

typings.record = <const K extends Keys[], V extends ObjectT>(
  value: V,
  ...keys: K
) => {
  const object = keys.reduce((acc, key) => {
    acc[key] = value;
    return acc;
  }, {} as any);

  return object as Record<K[number] extends never ? Keys : K[number], V>;
};

typings.any = <T extends ObjectT>(value: T) => value;

typings.optional = <T extends __PrimitiveObject | __PrimitiveObject[]>(
  value?: T,
) =>
  ({
    [OPTIONAL]: value,
  }) as Optional<T>;

/**
 * @deprecated
 *
 * Use optional instead
 */
typings.maybe = typings.optional;

typings.litterals = <const T extends (string | number | boolean)[]>(
  ...values: T
) => values[0] as unknown as Custom<T[number]>;

typings.union = <T extends [ObjectT, ObjectT, ...ObjectT[]]>(
  ...values: T
) => {
  return values[0] as T[number];
};

typings.array = <T extends __PrimitiveObject | Optional>(value: T) =>
  ({ [ARRAY]: value }) as ArrayCustom<T>;

typings.tuple = <
  T extends [
    __PrimitiveObject | Optional | ArrayCustom,
    ...(__PrimitiveObject | Optional | ArrayCustom)[],
  ],
>(
  ...values: T
) => values;

type Discriminated<K extends Keys> = ObjectMap & Record<K, ObjectT>;

typings.discriminatedUnion = <
  const K extends Keys,
  T extends [Discriminated<K>, Discriminated<K>, ...Discriminated<K>[]],
>(
  _key: K,
  ...values: T
) => {
  return typings.union(...values);
};

type _IntersectionCustom<T extends ObjectMap[]> = T extends [
  infer First extends ObjectMap,
  ...infer Rest extends ObjectMap[],
]
  ? First & IntersectionCustom<Rest>
  : unknown;

export type IntersectionCustom<T extends ObjectMap[]> =
  _IntersectionCustom<T> extends infer R
    ? {
        [K in keyof R]: R[K];
      }
    : never;

typings.intersection = <T extends [ObjectMap, ObjectMap, ...ObjectMap[]]>(
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

typings.partial = <T extends ObjectMap>(value: T): PartialCustom<T> => {
  const entries = Object.entries(value).filter(([key]) => key !== PARTIAL);
  const out: any = {};

  entries.forEach(([key, value]) => {
    out[key] = value;
  });

  return out;
};

typings.soa = <T extends ObjectT>(value: T) => {
  return value as SoA<T>;
};

typings.sv = {} as Custom<StateValue>;

export type inferT<T extends ObjectT> = TransformObject<T>;
