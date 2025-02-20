import type { Fn } from '@bemedev/types';
import type { NoValue } from '~types';

export type PromisyD<R = any> = Promise<{ value: R; duration: number }>;

export type WithDuration_F = <P extends any[], R = any>(
  func: Fn<P, Promise<R>>,
) => Fn<P, PromisyD<R>>;

export const withDuration: WithDuration_F = func => {
  return async (...args) => {
    const startTime = process.uptime();
    const value = await func(...args);
    const endTime = process.uptime();

    const duration = endTime - startTime;
    return { value, duration };
  };
};

export type MeasureExecutionTime_F = (
  func: Fn<[], Promise<NoValue>>,
) => Promise<number>;

export const measureExecutionTime: MeasureExecutionTime_F = async func => {
  const _func = withDuration(func);
  const { duration } = await _func();
  return duration;
};
