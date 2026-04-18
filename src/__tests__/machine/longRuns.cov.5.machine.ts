import { createMachine } from '#machine';

export default createMachine(
  'src/__tests__/machine/longRuns.cov.5.machine',
  {
    __longRuns: true,
    initial: 'idle',
    states: {
      idle: { after: { DELAY: '/active' } },
      active: {},
    },
  },
);
