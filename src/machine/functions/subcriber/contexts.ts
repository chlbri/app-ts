import { decompose, type Recompose, type Ru } from '@bemedev/decompose';
import { type Fn } from '@bemedev/types';
import type { Decompose2 } from '../../types';

// #region type AssignByBey_F
export type AssignByBey_F = <
  T extends Ru,
  D extends Decompose2<T>,
  K extends Extract<keyof D, string>,
  R extends D[K],
>(
  obj: T,
  key: K,
  value: R,
) => T;
// #endregion
export interface AssignByBey {
  (obj: any, key: string, value: any): any;
  low: (obj: any, key: string, value: any) => any;
  typed: AssignByBey_F;
}

const _assignByKey: AssignByBey['low'] = (obj, key, value) => {
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
export const assignByBey: AssignByBey = (obj, key, value) => {
  return _assignByKey(obj, key, value);
};
assignByBey.low = _assignByKey;
assignByBey.typed = _assignByKey;

// #region type GetByKey_F
export type GetByKey_F = <T extends Ru, K extends keyof Decompose2<T>>(
  obj: T,
  key: Extract<K, string>,
) => Decompose2<T>[K];
// #endregion
export interface GetByKey {
  (obj: any, key: string): any;
  low: (obj: any, key: string) => any;
  typed: GetByKey_F;
}

const _getByKey: GetByKey['low'] = (obj, key) => {
  const func = decompose as unknown as Fn;
  const decomposed = func(obj);
  return decomposed[key];
};
export const getByKey: GetByKey = (obj, key) => _getByKey(obj, key);
getByKey.low = _getByKey;
getByKey.typed = _getByKey;

// #region type MergeByKey_F
export type MergeByKey_F = (
  obj: Ru,
) => <D extends Decompose2<typeof obj>, K extends keyof D>(
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
export const mergeByKey: MergeByKey = obj => _mergeByKey(obj);
mergeByKey.low = _mergeByKey;
mergeByKey.typed = _mergeByKey;
