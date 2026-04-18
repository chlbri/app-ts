import { createMachine } from '#machine';

export default createMachine(
  'src/__tests__/interpreters/legacy-options.3.machine',
  {
    initial: 'idle',
    states: {
      idle: {
        on: {
          CHECK: [
            {
              guards: 'isPositive',
              target: '/positive',
            },
            {
              guards: 'isNegative',
              target: '/negative',
            },
          ],
        },
      },
      positive: {},
      negative: {},
    },
  },
);
