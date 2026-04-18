import { createMachine } from '#machine';

export default createMachine(
  'src/__tests__/interpreters/coverage/actors/2ids.2.machine',
  {
    initial: 'idle',
    states: {
      idle: {
        on: { NEXT: '/working' },
        actors: {
          child1: {
            contexts: {
              '.': 'all',
              iter1: 'iter1',
            },
          },
        },
      },
      working: {
        on: { NEXT: '/idle' },
        actors: {
          child2: {
            contexts: {
              iter2: 'iter2',
            },
          },
        },
      },
    },
  },
);
