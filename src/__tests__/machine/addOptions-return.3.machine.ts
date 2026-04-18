import { createMachine } from '#machine';

export default createMachine(
  'src/__tests__/machine/addOptions-return.3.machine',
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
  {
    eventsMap: {
      CHECK: 'primitive',
    },
    context: 'number',
  },
);
