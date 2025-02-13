import sleep from '@bemedev/sleep';

export type SleepU_F = (ms?: number, times?: number) => Promise<undefined>;

export const sleepU: SleepU_F = async (ms = 0, times = 1) => {
  for (let i = 0; i < times; i++) await sleep(ms);
};
