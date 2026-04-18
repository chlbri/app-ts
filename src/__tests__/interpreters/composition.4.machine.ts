import { createMachine } from '#machine';

export default createMachine(
  'src/__tests__/interpreters/composition.4.machine',
  {
    initial: 'idle',
    states: {
      idle: {
        after: {
          DELAY: { actions: 'inc2' },
        },
      },
    },
  },
);
