import { createMachine } from '#machine';
import { DELAY } from './constants';

// #region machine1
export const machine1 = createMachine(
  'src/__tests__/interpreters/data/machine1',
  {
    initial: 'idle',

    states: {
      idle: {
        activities: { DELAY: 'inc' },
        on: { NEXT: { description: 'Next', target: '/final' } },
      },

      final: {},
    },
  },
);

machine1.addOptions(({ assign }) => ({
  actions: {
    inc: assign('context.iterator', ({ context }) => context.iterator + 1),
  },

  delays: { DELAY },
}));

export type Machine1 = typeof machine1;
// #endregion
