import { createMachine } from '#machine';

export default createMachine(
  'src/__tests__/machine/addOptions-return.2.machine',
  {
    initial: 'idle',
    states: {
      idle: {},
    },
  },
);
