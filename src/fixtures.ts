import type { ChangeProperty } from 'src/types/primitives';

export type TC = {
  val1?: string;
  val2?: number;
};

export type TE = { type: 'TIMER' | 'TIMER2' };

export const DEFAULT_ARGS = {
  context: {},
  event: { type: 'TIMER' },
} as const;

export type _TestParams<T> = {
  func?: T;
  strict?: boolean;
  args?: {
    context: TC;
    event: TE;
  };
};

export type TestParams<T, name extends string> = ChangeProperty<
  _TestParams<T>,
  'func',
  name
>;
