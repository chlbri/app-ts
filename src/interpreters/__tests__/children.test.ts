import num from '#bemedev/features/numbers/typings';
import { interpret } from '#interpreter';
import { createMachine } from '#machine';
import { constructTests, defaultC, defaultT } from '../../fixtures';
import { typings } from '#utils';

describe('Integration testing for interpret, Children', () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  const child = createMachine(
    {
      initial: 'idle',
      states: {
        idle: {
          activities: { DELAY: 'inc' },
        },
      },
    },
    { ...defaultT, context: num.type },
  ).provideOptions(({ assign }) => ({
    actions: {
      inc: assign('context', ({ context }) => context + 1),
    },
    delays: { DELAY: 100 },
  }));

  describe('#01 => context are same', () => {
    const parent = createMachine(
      {
        initial: 'idle',
        actors: {
          child: {
            contexts: {
              '.': '.',
            },
          },
        },
        states: {
          idle: {},
        },
      },
      {
        ...defaultT,
        pContext: num.type,
        actorsMap: {
          ...defaultT.actorsMap,
          children: {
            child: {},
          },
        },
      },
    ).provideOptions(() => ({
      actors: {
        children: {
          child: () => interpret(child, { context: 0 }),
        },
      },
    }));

    const service = interpret(parent, {
      ...defaultC,
      pContext: 0,
    });

    const { start, waiter, useIterator } = constructTests(
      service,
      ({ contexts, waiter }) => ({
        useIterator: contexts(({ pContext }) => pContext, 'iterator'),
        waiter: waiter(100),
      }),
    );

    test(...start(1));
    test(...useIterator(0, 2));
    test(...waiter(1, 3));
    test(...useIterator(1, 4));
    test(...waiter(1, 5));
    test(...useIterator(2, 6));
  });

  describe('#02 => context of child, and the type correspond to a subtype of privateContext of parent', () => {
    const parent = createMachine(
      {
        initial: 'idle',
        actors: {
          child: {
            contexts: {
              '.': 'iterator',
            },
          },
        },
        states: {
          idle: {},
          working: {
            on: {
              NEXT: '/idle',
            },
          },
        },
      },
      {
        ...defaultT,
        pContext: { iterator: num.type },
        eventsMap: { NEXT: {} },
        actorsMap: {
          ...defaultT.actorsMap,
          children: {
            child: {},
          },
        },
      },
    ).provideOptions(() => ({
      actors: {
        children: {
          child: () => interpret(child, { context: 0 }),
        },
      },
    }));

    const service = interpret(parent, {
      ...defaultC,
      pContext: { iterator: 0 },
    });

    const { start, waiter, useIterator, send } = constructTests(
      service,
      ({ contexts, waiter, sender }) => ({
        useIterator: contexts(
          ({ pContext }) => (pContext as any)?.iterator,
          'iterator',
        ),
        waiter: waiter(100),
        useNext: sender('NEXT'),
      }),
    );

    test(...start(1));
    test(...useIterator(0, 2));
    test(...waiter(1, 3));
    test(...useIterator(1, 4));
    test(...waiter(1, 5));
    test(...useIterator(2, 6));
    test(...send('NEXT', 7));
  });

  describe('#03 => Cover child->on', () => {
    const notify = vi.fn();
    const child = createMachine(
      {
        initial: 'active',
        states: {
          active: {
            on: { NEXT: '/inactive' },
          },
          inactive: {
            on: { NEXT: '/active' },
          },
        },
      },
      typings({
        eventsMap: {
          NEXT: 'primitive',
        },
      }),
    );

    const parent = createMachine(
      {
        actors: {
          child: {
            on: {
              NEXT: {
                actions: ['notify'],
              },
            },
          },
        },
        initial: 'idle',
        states: {
          idle: {
            on: {
              NEXT: {
                actions: ['sendChildNext'],
              },
            },
          },
        },
      },
      typings({
        eventsMap: {
          NEXT: 'primitive',
        },
        actorsMap: {
          children: {
            child: {
              NEXT: 'primitive',
            },
          },
        },
      }),
    ).provideOptions(({ sendTo, voidAction }) => ({
      actions: {
        notify: voidAction(() => {
          console.warn('REACH');
          notify();
        }),
        sendChildNext: sendTo(child)(() => {
          return {
            to: 'child',
            event: 'NEXT',
          };
        }),
      },
      actors: { children: { child: () => interpret(child) } },
    }));

    const service = interpret(parent);

    let calls = 0;
    const { send, useNotify, start } = constructTests(
      service,
      ({ index, tupleOf }) => {
        return {
          useNotify: (fails = false) => {
            const invite = `#${index()} => Notify is used => ${fails ? '(fails)' : ''}`;

            return tupleOf(invite, () => {
              if (!fails) calls++;
              expect(notify).toBeCalledTimes(calls);
            });
          },
        };
      },
    );

    test(...start());
    test(...useNotify(true));
    test(...send('NEXT'));
    test(...useNotify());
  });
});
