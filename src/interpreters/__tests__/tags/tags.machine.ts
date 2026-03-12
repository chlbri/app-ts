import { createMachine } from '#machine';
import { typings } from '#utils';

export const machine = createMachine(
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
  typings({
    eventsMap: { NEXT: 'primitive', PREV: 'primitive' },
  }),
);
