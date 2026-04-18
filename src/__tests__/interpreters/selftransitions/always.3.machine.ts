import { createMachine } from '#machine';

export default createMachine(
  'src/__tests__/interpreters/selftransitions/always.3.machine',
  {
    initial: 'idle',
    states: {
      idle: {
        always: [
          { guards: 'returnFalse', target: '/result1' },
          { guards: 'returnFalse', target: '/result3' },
          '/result2',
        ],
      },
      result1: {},
      result2: {},
      result3: {},
    },
  },
);
