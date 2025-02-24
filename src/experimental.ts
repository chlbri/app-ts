import { deepmerge } from 'deepmerge-ts';
import type { Contexts } from '~interpreters';
import type { PrimitiveObject } from '~types';

export const reduceRemainings = <
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
>(
  ...remains: (() => {
    result: Contexts<Pc, Tc>;
    target?: string;
  })[]
) => {
  const remaining = (): {
    target?: string;
    result: Contexts<Pc, Tc>;
  } => {
    let target: string | undefined = undefined;
    let result: Contexts<Pc, Tc> = {};

    remains
      .map(f => f())
      .forEach(remain => {
        target = remain.target;
        result = deepmerge(result, remain.result) as any;
      });

    return { target, result };
  };

  return remaining;
};
