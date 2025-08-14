import { createMachine } from '#machine';
import { typings } from '#utils';
import { DELAY } from './constants';

// #region machine1
export const machine1 = createMachine(
  {
    initial: 'idle',
    states: {
      idle: {
        activities: {
          DELAY: 'inc',
        },
        on: {
          NEXT: { description: 'Next', target: '/final' },
        },
      },
      final: {},
    },
  },
  typings({
    eventsMap: { NEXT: 'primitive' },
    promiseesMap: {},
    pContext: 'primitive',
    context: {
      iterator: 'number',
    },
  }),
);

machine1.addOptions(({ assign }) => ({
  actions: {
    inc: assign('context.iterator', ({ context }) => context.iterator + 1),
  },
  delays: {
    DELAY,
  },
}));

export type Machine1 = typeof machine1;
// #endregion
