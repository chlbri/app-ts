import { createMachine } from '#machine';

export default createMachine(
  'src/__tests__/interpreters/coverage/actors/child.2.machine',
  {
    initial: 'idle',
    states: {
      idle: {
        on: { NEXT: '/working' },
        actors: {
          child: {
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
          child: {
            contexts: {
              iter2: 'iter2',
            },
          },
        },
      },
    },
  },
);
