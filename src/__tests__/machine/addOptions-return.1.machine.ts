import { createMachine } from '#machine';

export default createMachine(
  'src/__tests__/machine/addOptions-return.1.machine',
  {
    initial: 'idle',
    states: {
      idle: {
        on: {
          INCREMENT: {
            actions: 'increment',
          },
        },
      },
    },
  },
  {
    eventsMap: {
      INCREMENT: 'primitive',
    },
    context: 'number',
  },
);
