import { createMachine } from '~machine';
import { typings } from '~utils';
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
          NEXT: { target: '/final', description: 'Next' },
        },
      },
      final: {},
    },
  },
  {
    eventsMap: { NEXT: typings.object },
    context: typings.context(
      typings.recordAll(typings.number(), 'iterator'),
    ),
    pContext: typings.object,
    promiseesMap: typings.object,
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
