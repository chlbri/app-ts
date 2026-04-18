import { createMachine } from '#machine';

export const machine = createMachine(
  'src/__tests__/interpreters/tags/tags.machine',
  {
    initial: 'idle',
    states: {
      idle: {
        tags: ['idle'],
        on: {
          NEXT: '/working',
        },
      },
      working: {
        tags: ['working', 'busy'],
        on: {
          NEXT: '/final',
          PREV: '/idle',
        },
      },
      final: {},
    },
  },
);
