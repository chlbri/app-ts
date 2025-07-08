import { castings, typings } from '@bemedev/types';
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
          NEXT: { target: '/final', description: 'Next' },
        },
      },
      final: {},
    },
  },
  {
    eventsMap: { NEXT: typings.objects.dynamic({}) },
    context: castings.commons.primitiveObject.dynamic({
      iterator: typings.numbers.type,
    }),
    pContext: typings.objects.dynamic({}),
    promiseesMap: typings.objects.dynamic({}),
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
