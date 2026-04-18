import { createMachine } from '#machine';

export default createMachine(
  'src/__tests__/interpreters/coverage/addOptions-return.2.machine',
  {
    initial: 'idle',
    states: {
      idle: {},
    },
  },
);
