import { createMachine } from '#machine';

export default createMachine(
  'src/__tests__/interpreters/selftransitions/always.1.machine',
  {
    initial: 'idle',
    states: {
      idle: {
        after: {
          DELAY: '/notActive',
        },
        always: '/active',
      },
      active: {},
      notActive: {},
    },
  },
);
