import { partialCall } from '@bemedev/basifun';

export type OrderedFnParams<T> = {
  index: keyof T;
  fn: (legacy: T) => () => void;
  position: 'before' | 'after';
};

export const orderedFn = <
  const A extends readonly string[],
  T extends Record<A[number], () => any> = Record<A[number], () => any>,
>(
  array: A,
  legacy: T,
  ...rest: OrderedFnParams<T>[]
) => {
  const FNS = array.map(fn => (legacy as any)[fn]);

  rest.forEach(({ index, fn, position }) => {
    const _index = array.findIndex(f => f === index);
    if (position === 'before') FNS.splice(_index, 0, fn(legacy));
    else FNS.splice(_index + 1, 0, fn(legacy));
  });

  FNS.forEach(f => f());
};

type PartialCall_T<
  A extends readonly string[],
  T = Record<A[number], () => any>,
> = (legacy: T, ...rest: OrderedFnParams<T>[]) => void;

export const reduceFn = <A extends readonly string[]>(
  array: A,
): PartialCall_T<A> => partialCall(orderedFn, array);
