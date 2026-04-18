import { createMachine } from '#machine';

export default createMachine(
  'src/__tests__/interpreters/legacy-options.10.machine',
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
