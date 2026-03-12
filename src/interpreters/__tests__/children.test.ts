import num from '#bemedev/features/numbers/typings';
import { interpret } from '#interpreter';
import { createMachine } from '#machine';
import { createFakeWaiter } from '@bemedev/vitest-extended';
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

    const useIterator = (index: number, value: number) => {
      const count = index > 10 ? '' + index : `0${index}`;
      const invite = `#${count} => iterator is (${value})`;
      const fn = () => {
        expect(service._pContext).toBe(value);
      };

      return [invite, fn] as const;
    };

    const useWaiter = createFakeWaiter.withDefaultDelay(vi, 100);

    test('#01 => start the service', () => {
      service.start();
    });

    test(...useIterator(2, 0));
    test(...useWaiter(3));
    test(...useIterator(4, 1));
    test(...useWaiter(5));
    test(...useIterator(6, 2));
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

    const useIterator = (index: number, value: number) => {
      const count = index > 10 ? '' + index : `0${index}`;
      const invite = `#${count} => iterator is (${value})`;
      const fn = () => {
        expect(service._pSelect('iterator')).toBe(value);
      };

      return [invite, fn] as const;
    };

    const useWaiter = createFakeWaiter.withDefaultDelay(vi, 100);

    test('#01 => start the service', () => {
      service.start();
    });

    test(...useIterator(2, 0));
    test(...useWaiter(3));
    test(...useIterator(4, 1));
    test(...useWaiter(5));
    test(...useIterator(6, 2));
    test('#07 => send NEXT event', () => {
      service.send('NEXT');
    });
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
