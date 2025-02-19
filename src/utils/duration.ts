import type { Fn } from '@bemedev/types';

export const measureExecutionTime = async (func: Fn<[]>) => {
  const startTime = process.uptime();
  await func();
  const endTime = process.uptime();
  const duration = endTime - startTime;

  return duration * 1000;
};
