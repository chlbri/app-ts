import { createMachine } from '#machine';

export default createMachine(
  'src/__tests__/interpreters/coverage/addOptions-return.1.machine',
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
);
