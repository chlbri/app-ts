import { t } from '@bemedev/types';
import { createMachine } from '~machine';
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
          NEXT: '/final',
        },
      },
      final: {},
    },
  },
  {
    eventsMap: {
      NEXT: {},
    },
    context: t.buildObject({ iterator: t.number }),
    pContext: t.object,
  },
  { '/': 'idle' },
);

machine1.addOptions(() => ({
  actions: {
    inc: (pContext, context) => {
      context.iterator++;
      return { context, pContext };
    },
  },
  delays: {
    DELAY,
  },
}));
// #endregion
