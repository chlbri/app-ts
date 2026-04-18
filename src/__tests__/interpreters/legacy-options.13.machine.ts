import { createMachine } from '#machine';

export default createMachine(
  'src/__tests__/interpreters/legacy-options.13.machine',
  {
    initial: 'idle',
    states: {
      idle: {
        on: {
          OP1: { actions: 'op1' },
          OP2: { actions: 'op2' },
          OP3: { actions: 'op3' },
        },
      },
    },
  },
);
