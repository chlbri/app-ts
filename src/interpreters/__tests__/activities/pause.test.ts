import tupleOf from '#bemedev/features/arrays/castings/tuple';
import { DELAY } from '#fixturesData';
import { interpret } from '#interpreter';
import { createMachine } from '#machine';
import { typings } from '#utils';
import { fakeWaiter } from 'src/fixtures';

vi.useFakeTimers();
describe('#02 => Pause activities on events', () => {
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
      // pContext: 'primitive',

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
            ({ context }) => context?.iterator + 1000,
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
      delays: {},
    }),
  );

  const service = interpret(machine101, {
    exact: true,
    context: { iterator: 0 },
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
