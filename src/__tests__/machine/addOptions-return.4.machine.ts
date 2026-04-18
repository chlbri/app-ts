import { createMachine } from '#machine';

const machine = createMachine(
  'src/__tests__/machine/addOptions-return.4.machine',
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

export default machine;
