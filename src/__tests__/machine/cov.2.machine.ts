import { createMachine } from '#machine';

const idM = 'machineNotDefined' as const;

export default createMachine(
  'src/__tests__/machine/cov.2.machine',
  {
    initial: 'idle',
    states: {
      idle: {},
    },
    actors: {
      [idM]: {
        on: {},
      },
    },
  },
  {},
);
