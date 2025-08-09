import type { Contexts } from '#interpreters';
import type { Describer, Describer2 } from '#types';
import type { types } from '@bemedev/types';
import { deepmerge } from 'deepmerge-ts';

export const reduceRemainings = <
  Pc = any,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
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

export type ToDescriber_F = (arg: string | Describer) => Describer2;

export const toDescriber: ToDescriber_F = name => {
  const check = typeof name === 'object';
  if (check) {
    return name;
  }
  return { name };
};
