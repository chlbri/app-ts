import { createMachine } from '#machine';

export default createMachine(
  'src/__tests__/interpreters/legacy-options.7.machine',
  {
    initial: 'idle',
    states: {
      idle: {
        on: {
          NEXT: {
            actions: 'increment',
          },
          TRIPLE: {
            actions: 'tripleIncrement',
          },
        },
      },
    },
  },
);
