import type { Fn } from '@bemedev/types';

export type Asyncfy_F = <P extends any[], R = any>(
  fn: Fn<P, R>,
) => Fn<P, Promise<R>>;

export const asyncfy: Asyncfy_F = fn => {
  return async (...args) => fn(...args);
};
