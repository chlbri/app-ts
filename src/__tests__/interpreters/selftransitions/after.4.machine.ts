import { createMachine } from '#machine';

export default createMachine(
  'src/__tests__/interpreters/selftransitions/after.4.machine',
  {
    initial: 'idle',
    states: {
      idle: {
        after: {
          DELAY2: '/active',
        },
        on: {
          NEXT: '/active',
        },
      },
      active: {
        on: {
          NEXT: '/idle',
        },
      },
    },
  },
);
