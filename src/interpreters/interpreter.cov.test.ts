import tupleOf from '#bemedev/features/arrays/castings/tuple';
import { fakeWaiter } from '#fixtures';
import { DELAY } from '#fixturesData';
import { interpret } from '#interpreter';
import { createMachine } from '#machine';
import { typings } from '#utils';

beforeAll(() => {
  vi.useFakeTimers();
  // Mock console.log to prevent output in CI environment
});

describe('Covers all inner actions', () => {
  describe('#01 => Performs activities on events', () => {
    const machine101 = createMachine(
      {
        initial: 'idle',
        states: {
          idle: {
            activities: {
              DELAY: 'inc',
            },
            on: {
              PAUSE: { actions: 'pause' },
              RESUME: { actions: 'resume' },
              STOP: { actions: 'stop' },
            },
          },
        },
      },
      typings({
        eventsMap: {
          PAUSE: 'primitive',
          RESUME: 'primitive',
          STOP: 'primitive',
        },

        context: {
          iterator: 'number',
        },
      }),
    ).provideOptions(
      ({ assign, pauseActivity, resumeActivity, stopActivity }) => ({
        actions: {
          inc: assign(
            'context.iterator',
            ({ context: { iterator } }) => iterator + 1,
          ),
          pause: pauseActivity('/idle::DELAY'),
          resume: resumeActivity('/idle::DELAY'),
          stop: stopActivity('/idle::DELAY'),
        },
        delays: {
          DELAY,
        },
      }),
    );

    const service = interpret(machine101, {
      pContext: {},
      context: { iterator: 0 },
      exact: true,
    });

    type SE = Parameters<typeof service.send>[0];

    // #region Hooks
    const useSend = (event: SE, index: number) => {
      const invite = `#${index < 10 ? '0' + index : index} => Send a "${(event as any).type ?? event}" event`;

      return tupleOf(invite, () => service.send(event));
    };

    const useWaiter = (times: number, index: number) => {
      const invite = `#${index < 10 ? '0' + index : index} => Wait ${times} times the delay`;

      return tupleOf(invite, () => fakeWaiter(DELAY, times));
    };

    const useIterator = (iterator: number, index: number) => {
      const invite = `#${index < 10 ? '0' + index : index} => iterator is "${iterator}"`;
      return tupleOf(invite, async () => {
        expect(service.select('iterator')).toBe(iterator);
      });
    };
    // #endregion

    test('#00 => Start the machine', () => {
      service.start();
    });

    test(...useIterator(0, 1));

    test(...useWaiter(6, 2));

    test(...useIterator(6, 3));

    test(...useSend('PAUSE', 4));

    test(...useIterator(6, 5));

    test(...useWaiter(6, 6));

    test(...useIterator(6, 7));

    test(...useSend('RESUME', 8));

    test(...useIterator(6, 9));

    test(...useWaiter(6, 10));

    test(...useIterator(12, 11));

    test(...useWaiter(6, 12));

    test(...useIterator(18, 13));

    test(...useSend('STOP', 14));

    test(...useIterator(18, 15));

    test(...useWaiter(6, 16));

    test(...useIterator(18, 17));

    test(...useSend('RESUME', 18));

    test(...useIterator(18, 19));

    test(...useWaiter(6, 20));

    test(...useIterator(18, 21));

    test('#22 => Dispose', service.dispose);
  });

  describe('#02 => Performs activities on events', () => {
    const machine101 = createMachine(
      {
        initial: 'idle',
        states: {
          idle: {
            entry: 'inc',
            on: {
              PAUSE: { actions: 'pause' },
              RESUME: { actions: 'resume' },
              STOP: { actions: 'stop' },
              NEXT: '/next',
            },
          },
          next: {
            always: '/idle',
          },
        },
      },
      typings({
        eventsMap: {
          PAUSE: 'primitive',
          RESUME: 'primitive',
          STOP: 'primitive',
          NEXT: 'primitive',
        },

        promiseesMap: 'primitive',
        pContext: 'primitive',

        context: {
          iterator: 'number',
        },
      }),
    ).provideOptions(
      ({ assign, pauseTimer, resumeTimer, stopTimer, debounce }) => ({
        actions: {
          inc: debounce(
            assign(
              'context.iterator',
              ({ context: { iterator } }) => iterator + 1000,
            ),
            {
              ms: DELAY * 10,
              id: 'inc',
            },
          ),
          pause: pauseTimer('inc'),
          resume: resumeTimer('inc'),
          stop: stopTimer('inc'),
        },
        delays: {
          DELAY,
        },
      }),
    );

    const service = interpret(machine101, {
      pContext: {},
      context: { iterator: 0 },
      exact: true,
    });

    type SE = Parameters<typeof service.send>[0];

    // #region Hooks
    const useSend = (event: SE, index: number) => {
      const invite = `#${index < 10 ? '0' + index : index} => Send a "${(event as any).type ?? event}" event`;

      return tupleOf(invite, () => service.send(event));
    };

    const useWaiter = (times: number, index: number) => {
      const invite = `#${index < 10 ? '0' + index : index} => Wait ${times} times the delay`;

      return tupleOf(invite, () => fakeWaiter(DELAY, times));
    };

    const useIterator = (iterator: number, index: number) => {
      const invite = `#${index < 10 ? '0' + index : index} => iterator is "${iterator}"`;
      return tupleOf(invite, async () => {
        expect(service.select('iterator')).toBe(iterator);
      });
    };

    service.subscribe(state => console.log(state.value));
    // #endregion

    describe('TESTS', () => {
      test('#00 => Start the machine', () => {
        service.start();
      });

      test(...useIterator(0, 1));

      test(...useWaiter(5, 2));

      test(...useIterator(0, 3));

      test(...useWaiter(5, 4));

      test(...useIterator(1000, 5));

      test(...useSend('NEXT', 6));

      test(...useIterator(1000, 7));

      test(...useWaiter(10, 8));

      test(...useIterator(2000, 9));

      test(...useWaiter(20, 10));

      test(...useIterator(2000, 11));

      test(...useSend('NEXT', 12));

      test(...useIterator(2000, 13));

      test(...useWaiter(5, 14));

      test(...useSend('PAUSE', 15));

      test(...useIterator(2000, 16));

      test(...useWaiter(15, 17));

      test(...useIterator(2000, 18));

      test(...useSend('RESUME', 19));

      test(...useIterator(2000, 20));

      test(...useWaiter(2, 21));

      test(...useIterator(2000, 22));

      test(...useWaiter(3, 23));

      test(...useIterator(3000, 24));

      test(...useWaiter(10, 25));

      test(...useIterator(3000, 26));

      test(...useSend('NEXT', 27));

      test(...useIterator(3000, 28));

      test(...useWaiter(5, 29));

      test(...useIterator(3000, 30));

      test(...useSend('STOP', 31));

      test(...useIterator(3000, 32));

      test(...useWaiter(25, 33));

      test(...useIterator(3000, 34));

      test(...useSend('RESUME', 35));

      test(...useIterator(3000, 36));

      test(...useWaiter(25, 37));

      test(...useIterator(3000, 38));

      test(...useSend('NEXT', 39));

      test(...useIterator(3000, 40));

      test(...useWaiter(10, 41));

      test(...useIterator(4000, 42));

      test('#43 => Dispose', service.dispose);
    });
  });

  describe('#03 => Performs send to itself actions', () => {
    const machine101 = createMachine(
      {
        entry: 'init',
        initial: 'idle',
        states: {
          idle: {
            on: {
              DECREMENT: { actions: 'dec' },
              INCREMENT: { actions: 'inc' },
              REDECREMENT: { actions: 'sendDec' },
              NEXT: '/next',
            },
          },
          next: {
            on: {
              NEXT: '/idle',
              'INCREMENT.FORCE': { actions: 'forceSendInc' },
              DECREMENT: { actions: 'sendDec' },
              INCREMENT: { actions: ['inc', 'inc'] },
            },
          },
        },
      },
      typings({
        eventsMap: {
          DECREMENT: 'primitive',
          REDECREMENT: 'primitive',
          INCREMENT: 'primitive',
          'INCREMENT.FORCE': 'primitive',
          NEXT: 'primitive',
        },

        promiseesMap: 'primitive',
        pContext: 'primitive',

        context: typings.partial({
          iterator: 'number',
        }),
      }),
    ).provideOptions(({ assign, forceSend, resend }) => ({
      actions: {
        inc: assign(
          'context.iterator',
          ({ context: { iterator } }) => iterator! + 1,
        ),

        init: assign('context.iterator', () => 0),
        dec: assign(
          'context.iterator',
          ({ context: { iterator } }) => iterator! - 1,
        ),
        forceSendInc: forceSend('INCREMENT'),
        sendDec: resend('DECREMENT'),
      },
    }));

    const service = interpret(machine101);

    type SE = Parameters<typeof service.send>[0];

    // #region Hooks
    const useSend = (event: SE, index: number) => {
      const invite = `#${index < 10 ? '0' + index : index} => Send a "${(event as any).type ?? event}" event`;

      return tupleOf(invite, () => service.send(event));
    };

    const useIterator = (iterator: number, index: number) => {
      const invite = `#${index < 10 ? '0' + index : index} => iterator is "${iterator}"`;
      return tupleOf(invite, async () => {
        expect(service.select('iterator')).toBe(iterator);
      });
    };

    const useValue = (value: string, index: number) => {
      const invite = `#${index < 10 ? '0' + index : index} => value is "${value}"`;
      return tupleOf(invite, async () => {
        expect(service.value).toBe(value);
      });
    };
    // #endregion

    describe('TESTS', () => {
      test('#00 => Start the machine', () => {
        service.start();
      });

      test(...useValue('idle', 8));

      test(...useSend('NEXT', 9));

      test(...useValue('next', 10));

      // #region "next" state
      test(...useIterator(0, 11));

      test(...useSend('INCREMENT', 12));

      test(...useIterator(2, 13));

      test(...useSend('INCREMENT.FORCE', 14));

      test(...useIterator(5, 15));

      test(...useSend('INCREMENT', 16));

      test(...useIterator(7, 17));

      test(...useSend('REDECREMENT', 18));

      test(...useIterator(7, 19));

      // #endregion

      test('#36 => Dispose', service.dispose);
    });
  });

  describe('#03.bis - cov => Performs send to itself actions', () => {
    const machine101 = createMachine(
      {
        entry: 'init',
        initial: 'idle',
        states: {
          idle: {
            on: {
              DECREMENT: { actions: 'dec' },
              INCREMENT: { actions: 'inc' },
              REDECREMENT: { actions: 'sendDec' },
              NEXT: '/next',
            },
          },
          next: {
            on: {
              NEXT: '/idle',
              'INCREMENT.FORCE': { actions: 'forceSendInc' },
              REDECREMENT: { actions: 'sendDec' },
            },
          },
        },
      },
      typings({
        eventsMap: {
          DECREMENT: 'primitive',
          REDECREMENT: 'primitive',
          INCREMENT: 'primitive',
          'INCREMENT.FORCE': 'primitive',
          NEXT: 'primitive',
        },

        promiseesMap: 'primitive',
        pContext: 'primitive',

        context: typings.partial({
          iterator: 'number',
        }),
      }),
    ).provideOptions(({ assign, forceSend, resend }) => ({
      actions: {
        inc: assign('context.iterator', ({ context: { iterator } }) => {
          if (iterator === undefined) return;

          return iterator + 1;
        }),
        dec: assign('context.iterator', ({ context: { iterator } }) => {
          if (iterator === undefined) return;
          return iterator - 1;
        }),

        init: assign('context.iterator', () => 0),

        forceSendInc: forceSend('INCREMENT'),
        sendDec: resend('DECREMENT'),
      },
    }));

    const service = interpret(machine101, {
      exact: true,
    });

    type SE = Parameters<typeof service.send>[0];

    // #region Hooks
    const useSend = (event: SE, index: number) => {
      const invite = `#${index < 10 ? '0' + index : index} => Send a "${(event as any).type ?? event}" event`;

      return tupleOf(invite, () => service.send(event));
    };

    const useIterator = (iterator: number, index: number) => {
      const invite = `#${index < 10 ? '0' + index : index} => iterator is "${iterator}"`;
      return tupleOf(invite, async () => {
        expect(service.select('iterator')).toBe(iterator);
      });
    };

    const useValue = (value: string, index: number) => {
      const invite = `#${index < 10 ? '0' + index : index} => value is "${value}"`;
      return tupleOf(invite, async () => {
        expect(service.value).toBe(value);
      });
    };
    // #endregion

    describe('TESTS', () => {
      test('#00 => Start the machine', () => {
        service.start();
      });

      // #region "idle" state
      test(...useIterator(0, 1));

      test(...useSend('INCREMENT', 2));

      test(...useIterator(1, 3));

      test(...useSend('INCREMENT', 4));

      test(...useIterator(2, 5));

      test(...useSend('DECREMENT', 6));

      test(...useIterator(1, 7));
      // #endregion

      test(...useValue('idle', 8));

      test(...useSend('NEXT', 9));

      test(...useValue('next', 10));

      // #region "next" state
      test(...useIterator(1, 11));

      test(...useSend('INCREMENT', 12));

      test(...useIterator(1, 13));

      test(...useSend('INCREMENT.FORCE', 14));

      test(...useIterator(2, 15));

      test(...useSend('INCREMENT', 16));

      test(...useIterator(2, 17));

      test(...useSend('REDECREMENT', 18));

      test(...useIterator(2, 19));
      // #endregion

      test(...useValue('next', 20));

      test(...useSend('NEXT', 21));

      test(...useValue('idle', 22));

      // #region "idle" state again

      test(...useIterator(2, 23));

      test(...useSend('REDECREMENT', 24));

      test(...useIterator(1, 25));

      test(...useSend('DECREMENT', 26));

      test(...useIterator(0, 27));

      test(...useSend('INCREMENT', 28));

      test(...useIterator(1, 29));

      test(...useSend('INCREMENT.FORCE', 30));

      test(...useIterator(1, 31));

      test(...useSend('INCREMENT', 32));

      test(...useIterator(2, 33));

      test(...useSend('REDECREMENT', 34));

      test(...useIterator(1, 35));

      // #endregion

      test('#36 => Dispose', service.dispose);
    });
  });
});
