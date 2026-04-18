import { createMachine } from '#machine';

export default createMachine(
  'src/__tests__/interpreters/composition.2.machine',
  {
    initial: 'idle',
    states: {
      idle: {
        on: {
          NEXT: { actions: 'inc' },
        },
      },
    },
  },
);
