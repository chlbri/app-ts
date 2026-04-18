import { createMachine } from '#machine';

export default createMachine(
  'src/__tests__/interpreters/legacy-options.11.machine',
  {
    initial: 'idle',
    states: {
      idle: {
        on: {
          ADD: {
            actions: 'add',
          },
          MULTIPLY: {
            actions: 'multiply',
          },
        },
      },
    },
  },
);
