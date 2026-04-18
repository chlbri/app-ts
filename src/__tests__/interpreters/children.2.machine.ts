import { createMachine } from '#machine';

export default createMachine(
  'src/__tests__/interpreters/children.2.machine',
  {
    initial: 'idle',
    actors: {
      child: {
        contexts: {
          '.': '.',
        },
      },
    },
    states: {
      idle: {},
    },
  },
);
