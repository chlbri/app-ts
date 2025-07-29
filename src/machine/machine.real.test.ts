import { castings } from '@bemedev/types';
import { interpret } from '~interpreter';
import { createMachine } from '~machine';
import { nextSV, type StateValue } from '~states';
import { typings } from '~utils';

describe('Real life testing', () => {
  const actions = {
    exit: 'inc',
    entry: 'inc',
  } as const;

  const machine = createMachine(
    {
      ...actions,
      states: {
        idle: {
          ...actions,
          on: {
            NEXT: '/parallel',
          },
        },
        compound: {
          ...actions,
          on: {
            PREVIOUS: '/idle',
          },
          states: {
            idle: {
              ...actions,
              on: {
                NEXT: '/compound/next',
              },
            },
            next: {
              ...actions,
              on: {
                PREVIOUS: '/compound/idle',
                NEXT: '/parallel',
              },
            },
          },
        },
        parallel: {
          ...actions,
          on: {
            PREVIOUS: '/compound/next',
          },
          type: 'parallel',
          states: {
            atomic: {
              ...actions,
              on: {
                NEXT: '/idle',
              },
              states: {
                idle: {
                  entry: 'inc',
                  on: {
                    NEXT: '/parallel/atomic/next',
                  },
                },
                next: {
                  ...actions,
                  on: {
                    PREVIOUS: '/parallel/atomic/idle',
                  },
                },
              },
            },
            compound: {
              ...actions,
              on: {
                NEXT: '/compound',
              },
              states: {
                idle: {
                  ...actions,
                  on: {
                    NEXT: '/parallel/compound/next',
                  },
                },
                next: {
                  ...actions,
                  on: {
                    PREVIOUS: '/parallel/compound/idle',
                  },
                },
              },
            },
          },
        },
      },
    },
    typings({
      eventsMap: {
        NEXT: 'primitive',
        PREVIOUS: 'primitive',
      },
      context: 'number',
    }),
    {
      '/': 'idle',
      '/compound': 'idle',
      '/parallel/atomic': 'idle',
      '/parallel/compound': 'idle',
    },
  ).provideOptions(({ assign }) => ({
    actions: {
      inc: assign('context', ({ context }) => context + 1),
    },
  }));

  const service = interpret(machine, {
    context: 0,
  });

  // #region Hooks
  type SE = Parameters<typeof service.send>[0];

  const useSend = (event: SE, index: number) => {
    const invite = `#${index < 10 ? '0' + index : index} => Send a "${(event as any).type ?? event}" event`;

    return castings.arrays.tupleOf(invite, () => service.send(event));
  };

  const useIterator = (num: number, index: number) => {
    const invite = `#${index < 10 ? '0' + index : index} => iterator is "${num}"`;
    return castings.arrays.tupleOf(invite, async () => {
      expect(service.state.context).toBe(num);
    });
  };

  const useValue = (value: StateValue, index: number) => {
    const invite = `#${index < 10 ? '0' + index : index} => value match`;
    return castings.arrays.tupleOf(invite, () => {
      expect(service.state.value).toEqual(value);
    });
  };

  // #endregion

  describe.only('TESTS', () => {
    test('#00 => start the machine', service.start);

    test(...useValue('idle', 1));
    test(...useIterator(2, 2));
    test(...useSend('NEXT', 3));

    test(
      ...useValue(
        {
          parallel: {
            atomic: 'idle',
            compound: 'idle',
          },
        },
        4,
      ),
    );

    test('#debug', () => {
      const value = service.state.value;
      console.warn('value', nextSV(value, '/parallel/atomic/next'));
    });

    test(...useIterator(8, 5));

    test(...useSend('NEXT', 6));

    test(
      ...useValue(
        {
          parallel: {
            atomic: 'next',
            compound: 'next',
          },
        },
        7,
      ),
    );

    test(...useIterator(11, 8));

    test(...useSend('NEXT', 9));

    test(...useValue('idle', 10));

    test(...useIterator(17, 11));

    test(...useSend('PREVIOUS', 12));

    test(...useValue('idle', 13));

    test(...useIterator(17, 14));

    test(...useSend('NEXT', 15));

    test(
      ...useValue(
        {
          parallel: {
            atomic: 'idle',
            compound: 'idle',
          },
        },
        16,
      ),
    );

    test(...useIterator(23, 17));

    test(...useSend('PREVIOUS', 18));

    test(...useValue({ compound: 'next' }, 19));

    test(...useIterator(30, 20));
  });
});
