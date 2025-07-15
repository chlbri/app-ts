import { type types } from '@bemedev/types';

type PrimitiveS = 'string' | 'number' | 'boolean' | 'null' | 'undefined';

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
          : T;

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
export const PARTIAL = '$$app-ts => partial$$' as const;

export type Custom<T = any> = {
  [CUSTOM]: T;
};

export type PartialCustom = {
  [PARTIAL]: undefined;
};

type PrimitiveObjectMap = {
  [key: types.Keys]: types.SoRa<_PrimitiveObject>;
};
type _PrimitiveObject =
  | Types
  | PrimitiveObjectMap
  | Custom
  | PartialCustom;

/**
 * A type that represents a primitive object, which can be a primitive value or an object
 *
 * @remark
 */
type PrimitiveObject = _PrimitiveObject;

export type Args<
  E extends PrimitiveObject = PrimitiveObject,
  P extends PrimitiveObject = PrimitiveObject,
> = {
  eventsMap: E;
  pContext: PrimitiveObject;
  context: PrimitiveObject;
  promiseesMap: P;
};

export type TransformPrimitiveObject<T> = T extends Types
  ? TransformTypes<T>
  : T extends Custom<infer TCustom>
    ? TCustom
    : T extends PartialCustom
      ? Partial<TransformPrimitiveObject<types.NOmit<T, typeof PARTIAL>>>
      : T extends types.AnyArray<any>
        ? T[number] extends infer TKN extends types.PrimitiveObject
          ? TransformPrimitiveObject<TKN>[]
          : never
        : {
            [K in keyof T]: TransformPrimitiveObject<T[K]>;
          };

const transformPrimitiveObject = (obj: any): any => {
  const _obj = obj as any;

  const checkArray = Array.isArray(_obj);
  if (checkArray) {
    return _obj.map(transformPrimitiveObject) as any;
  }

  const checkObject = typeof _obj === 'object';
  if (checkObject) {
    const isCustom = Object.keys(_obj).every(key => key === CUSTOM);
    const out: any = {};
    if (isCustom) return out;

    const entries = Object.entries(_obj).filter(
      ([key]) => key !== PARTIAL,
    );
    if (entries.length === 0) return out;
    entries.forEach(([key, value]) => {
      out[key] = transformPrimitiveObject(value as any);
    });

    return out;
  }

  return transformTypes(_obj);
};

export type TransformArgs<T extends Partial<Args>> = {
  eventsMap: TransformPrimitiveObject<T['eventsMap']>;
  pContext: TransformPrimitiveObject<T['pContext']>;
  context: TransformPrimitiveObject<T['context']>;
  promiseesMap: TransformPrimitiveObject<T['promiseesMap']>;
};

const DEFAULT_ARGS = {
  eventsMap: 'primitive',
  pContext: 'primitive',
  context: 'primitive',
  promiseesMap: 'primitive',
} satisfies Args;

const defaultArgs = <T extends Partial<Args>>(values: T) => {
  const args = { ...DEFAULT_ARGS, ...values } as Args;
  return args;
};

const typings = <T extends Partial<Args>>(args: T): TransformArgs<T> => {
  const out = transformPrimitiveObject(defaultArgs(args));
  return out;
};

typings.custom = <T = any>(value?: T) =>
  ({ [CUSTOM]: value }) as Custom<T>;
typings.partial = <T extends PrimitiveObject>(
  value: T,
): T & PartialCustom => {
  const entries = Object.entries(value).filter(([key]) => key !== PARTIAL);
  const out: any = {};

  entries.forEach(([key, value]) => {
    out[key] = value;
  });

  return out;
};

export default typings;
