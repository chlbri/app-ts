import {
  decompose,
  type Decompose,
  type Recompose,
} from '@bemedev/decompose';
import { type types } from '@bemedev/types';

// #region type AssignByBey_F
export type AssignByBey_F = <
  T extends types.Ru,
  D extends Decompose<T>,
  K extends Extract<keyof D, string>,
  R extends D[K],
>(
  obj: T,
  key: K,
  value: R,
) => T;
// #endregion
export interface AssignByKey {
  (obj: any, key: string, value: any): any;
  low: (obj: any, key: string, value: any) => any;
  typed: AssignByBey_F;
}

const _assignByKey: AssignByKey['low'] = (obj, key, value) => {
  const out: any = obj;
  const keys = (key as string).split('.');

  const check1 = keys.length === 1;
  if (check1) {
    out[key] = value;
    return out;
  }
  out[keys[0]] = _assignByKey(
    out[keys[0]],
    keys.slice(1).join('.'),
    value,
  );

  return out;
};

/**
 * Assigns a value to a path in an object.
 * @param obj The object to assign the value to
 * @param path The key to assign the value to, can be a nested key (e.g. 'a.b.c')
 * @param value The value to assign to the key
 * @returns The modified object with the value assigned to the specified key
 *
 * @see {@linkcode Decompose} for more details on object decomposition.
 */
export const assignByKey: AssignByKey = (obj, path, value) => {
  return _assignByKey(obj, path, value);
};

assignByKey.low = _assignByKey;
assignByKey.typed = _assignByKey;

// #region type GetByKey_F
export type GetByKey_F = <
  T extends types.Ru,
  K extends keyof Decompose<T>,
>(
  obj: T,
  key: Extract<K, string>,
) => Decompose<T>[K];
// #endregion
export interface GetByKey {
  (obj: any, key: string): any;
  low: (obj: any, key: string) => any;
  typed: GetByKey_F;
}

const _getByKey: GetByKey['low'] = (obj, key) => {
  const decomposed = decompose.low(obj, { start: false, object: 'both' });
  return (decomposed as any)[key];
};

/**
 * Retrieves a value from an object by a specified key.
 * @param obj The object to retrieve the value from
 * @param key The key to retrieve the value for, can be a nested key (e.g. 'a.b.c')
 * @returns The value associated with the specified key in the object
 *
 * @see {@linkcode Decompose} for more details on object decomposition.
 */
export const getByKey: GetByKey = (obj, key) => _getByKey(obj, key);

getByKey.low = _getByKey;
getByKey.typed = _getByKey;

// #region type MergeByKey_F
export type MergeByKey_F = (
  obj: types.Ru,
) => <D extends Decompose<typeof obj>, K extends keyof D>(
  key: Extract<K, string>,
  value: D[K],
) => Recompose<Pick<D, K>>;
// #endregion
export interface MergeByKey {
  (obj: any): (key: string, value: any) => any;
  low: (obj: any) => (key: string, value: any) => any;
  typed: MergeByKey_F;
}

const _mergeByKey: MergeByKey['low'] = () => {
  return (key, value) => {
    const out: any = {};
    const keys = key.toLocaleString().split('.');

    const check1 = keys.length === 1;
    if (check1) {
      out[key] = value;
    } else {
      out[keys[0]] = _mergeByKey(out[keys[0]])(
        keys.slice(1).join('.'),
        value,
      );
    }

    return out;
  };
};

/**
 * Creates a function that merges a value into an object at a specified key path.
 * @param obj The object to merge the value into
 * @returns A function that takes a key and a value, and merges the value into the object at the specified key path
 *
 * @see {@linkcode Decompose} for more details on object decomposition.
 */
export const mergeByKey: MergeByKey = obj => _mergeByKey(obj);

mergeByKey.low = _mergeByKey;
mergeByKey.typed = _mergeByKey;
