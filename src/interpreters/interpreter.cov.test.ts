import { castings } from '@bemedev/types';
import { DELAY } from '~fixturesData';
import { interpret } from '~interpreter';
import { createMachine } from '~machine';
import { typings } from '~utils';
import { fakeWaiter } from './__tests__/fixtures';

beforeAll(() => {
  vi.useFakeTimers();
});

describe('Covers all inner actions', () => {
  describe('#01 => Performs activities on events', () => {
    const machine101 = createMachine(
      {
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

        promiseesMap: 'primitive',
        pContext: 'primitive',

        context: {
          iterator: 'number',
        },
      }),
      { '/': 'idle' },
    ).provideOptions(
      ({ assign, pauseActivity, resumeActivity, stopActivity }) => ({
        actions: {
          inc: assign(
            'context.iterator',
            (_, { iterator }) => iterator + 1,
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

      return castings.arrays.tupleOf(invite, () => service.send(event));
    };

    const useWaiter = (times: number, index: number) => {
      const invite = `#${index < 10 ? '0' + index : index} => Wait ${times} times the delay`;

      return castings.arrays.tupleOf(invite, () =>
        fakeWaiter(DELAY, times),
      );
    };

    const useIterator = (iterator: number, index: number) => {
      const invite = `#${index < 10 ? '0' + index : index} => iterator is "${iterator}"`;
      return castings.arrays.tupleOf(invite, async () => {
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
      { '/': 'idle' },
    ).provideOptions(
      ({ assign, pauseTimer, resumeTimer, stopTimer, debounce }) => ({
        actions: {
          inc: debounce(
            assign(
              'context.iterator',
              (_, { iterator }) => iterator + 1000,
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

      return castings.arrays.tupleOf(invite, () => service.send(event));
    };

    const useWaiter = (times: number, index: number) => {
      const invite = `#${index < 10 ? '0' + index : index} => Wait ${times} times the delay`;

      return castings.arrays.tupleOf(invite, () =>
        fakeWaiter(DELAY, times),
      );
    };

    const useIterator = (iterator: number, index: number) => {
      const invite = `#${index < 10 ? '0' + index : index} => iterator is "${iterator}"`;
      return castings.arrays.tupleOf(invite, async () => {
        expect(service.select('iterator')).toBe(iterator);
      });
    };

    service.subscribe(state => console.log(state.value));
    // #endregion

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

    test('#22 => Dispose', service.dispose);
  });
});
