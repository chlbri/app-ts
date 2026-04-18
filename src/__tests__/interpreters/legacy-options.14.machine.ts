import { createMachine } from '#machine';

export default createMachine(
  'src/__tests__/interpreters/legacy-options.14.machine',
  {
    initial: 'idle',
    states: {
      idle: {
        on: {
          INCREMENT: {
            actions: 'increment',
          },
        },
      },
    },
  },
);
