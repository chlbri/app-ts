import { createMachine } from '#machine';

export default createMachine(
  'src/__tests__/machine/longRuns.cov.3.machine',
  {
    initial: 'idle',
    states: {
      idle: {
        on: { TEST: { target: 'idle', actions: 'slowAction' } },
      },
    },
  },
);
