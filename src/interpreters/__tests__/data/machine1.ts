import { notU, typings } from '#utils';
import { createMachine } from '#machine';
import { DELAY } from './constants';

// #region machine1
export const machine1 = createMachine(
  {
    initial: 'initialize',

    states: {
      initialize: {
        always: {
          actions: ['initializeContext', 'initializeIterator'],
          target: '/idle',
        },
      },

      idle: {
        activities: { DELAY: 'inc' },
        on: { NEXT: { description: 'Next', target: '/final' } },
      },

      final: {},
    },
  },

  typings({
    eventsMap: { NEXT: 'primitive' },
    context: { iterator: 'number' },
  }),
);

machine1.addOptions(({ assign }) => ({
  actions: {
    inc: assign(
      'context.iterator',
      ({ context }) => notU(context?.iterator) + 1,
    ),

    initializeIterator: assign('context.iterator', () => 0),
    initializeContext: assign('context', () => ({})),
  },

  delays: { DELAY },
}));

export type Machine1 = typeof machine1;
// #endregion
