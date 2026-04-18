import { createMachine } from '#machine';

export default createMachine(
  'src/__tests__/interpreters/coverage/addOptions-return.5.machine',
  {
    initial: 'idle',
    states: {
      idle: {
        on: {
          FIRST: { actions: 'first' },
          SECOND: { actions: 'second' },
        },
      },
    },
  },
);
