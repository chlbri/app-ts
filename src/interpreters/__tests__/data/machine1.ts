import { createMachine } from '#machine';
import { typings } from '#utils';
import { DELAY } from './constants';

// #region machine1
export const machine1 = createMachine(
  {
    states: {
      idle: {
        activities: {
          DELAY: 'inc',
        },
        on: {
          NEXT: { description: 'Next' },
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
  {
    initials: { '/': 'idle' },
    targets: {
      '/idle.on.NEXT': '/final',
    },
  },
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
