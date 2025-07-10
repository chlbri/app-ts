import type { AnyArray, Keys, SoRa } from '@bemedev/types/lib/types/types';

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

export type PrimitiveObjectMap = {
  [key: Keys]: SoRa<_PrimitiveObject>;
};
type _PrimitiveObject = Types | PrimitiveObjectMap;
/**
 * A type that represents a primitive object, which can be a primitive value or an object
 *
 * @remark
 */
type PrimitiveObject = _PrimitiveObject;

type RecordP = Record<Uppercase<string>, PrimitiveObject> | 'primitive';

type Args<E extends RecordP = RecordP, P extends RecordP = RecordP> = {
  eventsMap: E;
  pContext: PrimitiveObject;
  context: PrimitiveObject;
  promiseesMap: P;
};

type TransformPrimitiveObject<T> = T extends Types
  ? TransformTypes<T>
  : T extends AnyArray<any>
    ? T[number] extends infer TKN extends PrimitiveObject
      ? TransformPrimitiveObject<TKN>[]
      : never
    : {
        [K in keyof T]: TransformPrimitiveObject<T[K]>;
      };

const transformPrimitiveObject = (obj: any): any => {
  const _obj = obj as any;

  const checkObject = typeof _obj === 'object';
  if (checkObject) {
    const out: any = {};

    const entries = Object.entries(_obj);
    entries.forEach(([key, value]) => {
      out[key] = transformPrimitiveObject(value as any);
    });

    return out;
  }

  const checkArray = Array.isArray(_obj);
  if (checkArray) {
    return _obj.map(transformPrimitiveObject) as any;
  }

  return transformTypes(_obj);
};

export type TransformArgs<T extends Args> = {
  eventsMap: TransformPrimitiveObject<T['eventsMap']>;
  pContext: TransformPrimitiveObject<T['pContext']>;
  context: TransformPrimitiveObject<T['context']>;
  promiseesMap: TransformPrimitiveObject<T['promiseesMap']>;
};

type SimpleArgs = {
  eventsMap: any;
  pContext: any;
  context: any;
  promiseesMap: any;
};

const pypings = <
  const E extends RecordP = RecordP,
  const P extends RecordP = RecordP,
  T extends Args<E, P> = Args<E, P>,
>({
  eventsMap,
  promiseesMap,
  pContext,
  context,
}: T): TransformArgs<T> => {
  const out: SimpleArgs = {
    eventsMap: {},
    pContext: {},
    context: {},
    promiseesMap: {},
  };

  const entriesEvents = Object.entries(eventsMap);
  entriesEvents.forEach(([key, value]) => {
    out.eventsMap[key] = transformPrimitiveObject(value);
  });

  const entriesPromisees = Object.entries(promiseesMap);
  entriesPromisees.forEach(([key, value]) => {
    out.promiseesMap[key] = transformPrimitiveObject(value);
  });

  out.pContext = transformPrimitiveObject(pContext);
  out.context = transformPrimitiveObject(context);

  return out;
};

export default pypings;
