import { castings } from '@bemedev/types';
import { interpret } from '~interpreter';
import { createMachine } from '~machine';
import { nextSV, type StateValue } from '~states';
import { typings } from '~utils';

describe('#01 => Real life testing', () => {
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
            NEXT: '/idle',
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

  describe('TESTS', () => {
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

    test(
      ...useValue(
        {
          compound: 'idle',
        },
        10,
      ),
    );

    test(...useIterator(18, 11));

    test(...useSend('PREVIOUS', 12));

    test(
      ...useValue(
        {
          compound: 'idle',
        },
        13,
      ),
    );

    test(...useIterator(18, 14));

    test(...useSend('NEXT', 15));

    test(
      ...useValue(
        {
          compound: 'next',
        },
        16,
      ),
    );

    test(...useIterator(20, 17));

    test(...useSend('PREVIOUS', 18));

    test(...useValue({ compound: 'idle' }, 19));

    test(...useIterator(22, 20));

    test(...useSend('NEXT', 21));

    test(
      ...useValue(
        {
          compound: 'next',
        },
        22,
      ),
    );

    test(...useIterator(24, 23));
  });
});

describe('#02 => Cover', () => {
  const io = {
    exit: 'inc',
    entry: 'inc',
  } as const;

  const machine = createMachine(
    {
      states: {
        idle: {
          ...io,
          on: {
            NEXT: '/parallel',
          },
        },
        parallel: {
          ...io,
          type: 'parallel',
          states: {
            atomic: {
              ...io,

              states: {
                idle: {
                  ...io,
                  on: {
                    NEXT: '/parallel/atomic/next',
                  },
                },
                next: {
                  ...io,
                  on: {
                    PREVIOUS: '/parallel/atomic/idle',
                    NEXT: '/parallel/atomic/idle',
                  },
                },
              },
            },
            compound: {
              ...io,

              states: {
                idle: {
                  ...io,
                  on: {
                    NEXT: '/parallel/compound/compound',
                  },
                },
                compound: {
                  ...io,
                  states: {
                    idle: {
                      ...io,
                      on: {
                        NEXT: '/parallel/compound/compound/next',
                      },
                    },
                    next: {
                      ...io,
                      on: {
                        PREVIOUS: '/parallel/compound/compound/idle',
                        NEXT: '/idle',
                      },
                    },
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
      '/parallel/compound': 'idle',
      '/parallel/atomic': 'idle',
      '/parallel/compound/compound': 'idle',
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
    const invite = `#${index < 10 ? '0' + index : index} => values matchs`;
    return castings.arrays.tupleOf(invite, () => {
      expect(service.state.value).toEqual(value);
    });
  };

  // #endregion

  describe('TESTS', () => {
    test('#00 => start the machine', service.start);

    test(...useValue('idle', 1));

    test(...useIterator(1, 2));

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

    test(...useIterator(7, 5));

    test(...useSend('NEXT', 6));

    test(
      ...useValue(
        {
          parallel: {
            atomic: 'next',
            compound: {
              compound: 'idle',
            },
          },
        },
        7,
      ),
    );

    test(...useIterator(12, 8));

    test(...useSend('PREVIOUS', 9));

    test(...useIterator(14, 10));

    test(...useSend('NEXT', 11));

    test(
      ...useValue(
        {
          parallel: {
            atomic: 'next',
            compound: {
              compound: 'next',
            },
          },
        },
        12,
      ),
    );

    test(...useIterator(18, 13));

    test(...useSend('NEXT', 14));

    test(...useValue('idle', 15));

    test(...useIterator(25, 16));
  });
});
