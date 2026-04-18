import { createMachine } from '#machine';

export default createMachine(
  'src/__tests__/machine/asyncActions.4.machine',
  {
    initial: 'idle',
    states: {
      idle: {
        on: {
          TEST: {
            target: 'idle',
            actions: 'myAction',
          },
        },
      },
    },
  },
);
