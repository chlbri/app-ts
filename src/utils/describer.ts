import type { Describer, Describer2 } from '~types';

export type ToDescriber_F = (arg: string | Describer) => Describer2;

export const toDescriber: ToDescriber_F = name => {
  const check = typeof name === 'object';
  if (check) {
    return name;
  }
  return { name };
};
