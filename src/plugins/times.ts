import {
  NEXT_ORDERED_FNS,
  PAUSE_ORDERED_FNS,
  RESUME_ORDERED_FNS,
  START_ORDERED_FNS,
  STOP_ORDERED_FNS,
} from './constants';
import { OrderedFnParams, reduceFn } from './helpers';

export type TimesPlugin_Fn<
  A extends readonly string[],
  T extends Record<A[number], () => any> = Record<
    A[number],
    () => any
  >,
> = (...rest: OrderedFnParams<T>[]) => void;

export const start = reduceFn(START_ORDERED_FNS);
export const next = reduceFn(NEXT_ORDERED_FNS);
export const pause = reduceFn(PAUSE_ORDERED_FNS);
export const resume = reduceFn(RESUME_ORDERED_FNS);
export const stop = reduceFn(STOP_ORDERED_FNS);
