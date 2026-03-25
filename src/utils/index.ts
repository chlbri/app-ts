export { decompose, decomposeSV, recompose } from '@bemedev/decompose';
export type {
  Decompose,
  DecomposeKeys,
  DecomposeOptions,
} from '@bemedev/decompose';

import equal from 'fast-deep-equal';
export * from './environment';
export * from './merge';
export * from './nothing';
export * from './objects';
export * from './reduceFnMap';
export * from './reduceDescriber';
export * from './resolve';
export * from './strings';
export * from './toFunction';
export * from './undefined';
export { typings } from './typings';

export const deepEqual = <T>(a: T, b: T) => equal(a, b);
