import { isArray } from 'src/types/primitives';

export interface ToArray_F {
  <T>(obj: any): T[];
  typed: <T>(obj: T | T[] | readonly T[]) => Exclude<T, undefined>[];
}

export const toArray: ToArray_F = obj => {
  if (isArray(obj)) {
    return obj;
  } else {
    if (!obj) return [];
    return [obj];
  }
};

toArray.typed = toArray;
