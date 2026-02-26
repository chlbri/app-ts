import type { NotUndefined } from '#bemedev/globals/types';

export const notUndefined = <T>(value: T) => value as NotUndefined<T>;

export const notU = notUndefined;
