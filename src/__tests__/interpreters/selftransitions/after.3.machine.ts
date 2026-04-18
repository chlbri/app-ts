import { createMachine } from '#machine';

export default createMachine(
  'src/__tests__/interpreters/selftransitions/after.3.machine',
  {
    initial: 'idle',
    states: {
      idle: {
        after: {
          DELAY: { guards: 'returnFalse', target: '/result1' },
          DELAY2: '/result2',
        },
      },
      result1: {},
      result2: {},
    },
  },
);
