import { createMachine } from '#machine';

export default createMachine(
  'src/__tests__/interpreters/coverage/addOptions-return.3.machine',
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
          ],
        },
      },
      positive: {},
    },
  },
);
