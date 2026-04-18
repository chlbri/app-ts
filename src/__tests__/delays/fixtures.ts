import { DELAY } from '#fixturesData';
import { interpret } from '#interpreter';
import { createMachine } from '#machine';
import { typings } from '#utils';
import { constructTests } from '#fixtures';

export const machine1 = createMachine('src/__tests__/delays/fixtures',
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
      final: {
        on: {
          NEXT: '/idle',
        },
      },
    },
  },
  typings({
    eventsMap: { NEXT: 'primitive' },
    promiseesMap: {},
    context: {
      iterator: 'number',
    },
  }),
).provideOptions(({ assign }) => ({
  actions: {
    inc: assign('context.iterator', ({ context }) => context.iterator + 1),
  },
  delays: {
    DELAY,
  },
}));

export const hook = () => {
  const service = interpret(machine1, { context: { iterator: 0 } });

  const { useNext, useIterator, waiter, start, stop } = constructTests(
    service,
    ({ contexts, sender, waiter }) => ({
      useNext: sender('NEXT'),
      useIterator: contexts(
        ({ context }) => context?.iterator,
        'iterator',
      ),
      waiter: waiter(DELAY),
    }),
  );

  return {
    service,
    useNext,
    useIterator,
    waiter,
    start,
    stop,
  };
};
