import { createMachine } from '#machine';

export default createMachine(
  'src/__tests__/interpreters/children.3.machine',
  {
    initial: 'idle',
    actors: {
      child: {
        contexts: {
          '.': 'iterator',
        },
      },
    },
    states: {
      idle: {},
      working: {
        on: {
          NEXT: '/idle',
        },
      },
    },
  },
);
