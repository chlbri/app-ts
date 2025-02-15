import {
  decompose,
  type Decompose,
  type Recompose,
  type Ru,
} from '@bemedev/decompose';
import { t, type Fn } from '@bemedev/types';

export interface AssignByBey {
  <T extends object>(obj: T, key: string, value: any): T;

  low: (obj: any, key: string, value: any) => any;

  typed: <
    T extends Ru,
    D extends Decompose<T>,
    K extends Extract<keyof D, string>,
    R extends D[K],
  >(
    obj: T,
    key: K,
    value: R,
  ) => T;
}

export const assignByBey: AssignByBey = (obj, key, value) => {
  return assignByBey.low(obj, key, value);
};

assignByBey.low = (obj, key, value) => {
  const out: any = obj;
  const keys = (key as string).split('.');

  const check1 = keys.length === 1;
  if (check1) {
    out[key] = value;
    return out;
  }
  out[keys[0]] = assignByBey.low(
    out[keys[0]],
    keys.slice(1).join('.'),
    value,
  );

  return out;
};

assignByBey.typed = assignByBey.low;

export interface GetByKey {
  (obj: any, key: string): any;

  low: (obj: any, key: string) => any;

  typed: <T extends Ru, K extends keyof Decompose<T>>(
    obj: T,
    key: K,
  ) => Decompose<T>[K];
}

export const getByKey: GetByKey = (obj, key) => getByKey.low(obj, key);

getByKey.low = (obj, key) => {
  const decomposed = (decompose as unknown as Fn)(obj);
  return decomposed[key];
};

getByKey.typed = getByKey.low;

export type MergeByKey_F = (
  obj: Ru,
) => <D extends Decompose<typeof obj>, K extends keyof D>(
  key: K,
  value: D[K],
) => Recompose<Pick<D, K>>;

export interface MergeByKey {
  (obj: any): (key: string, value: any) => any;

  low: (obj: any) => (key: string, value: any) => any;

  typed: (
    obj: Ru,
  ) => <D extends Decompose<typeof obj>, K extends keyof D>(
    key: Extract<K, string>,
    value: D[K],
  ) => Recompose<Pick<D, K>>;
}

export const mergeByKey: MergeByKey = () => {
  return (key, value) => {
    const out: any = {};
    const keys = key.toLocaleString().split('.');

    const check1 = keys.length === 1;
    if (check1) {
      out[key] = value;
    } else {
      out[keys[0]] = mergeByKey(t.anify())(keys.slice(1).join('.'), value);
    }

    return out;
  };
};

mergeByKey.low = obj => {
  return (key, value) => {
    const out: any = obj;
    const keys = key.toLocaleString().split('.');

    const check1 = keys.length === 1;
    if (check1) {
      out[key] = value;
    } else {
      out[keys[0]] = mergeByKey.low(obj[keys[0]])(
        keys.slice(1).join('.'),
        value,
      );
    }

    return out;
  };
};

mergeByKey.typed = obj => {
  return (key, value) => {
    return mergeByKey.low(obj)(key, value);
  };
};
