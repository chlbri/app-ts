import { DELAY } from '#fixturesData';
import { interpret } from '#interpreter';
import { createMachine } from '#machine';
import { typings } from '#utils';
import { constructTests } from '#fixtures';

vi.useFakeTimers();
describe('Pause activities on events', () => {
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

  const { send, waiter, useIterator, start, dispose } = constructTests(
    service,
    ({ contexts, waiter }) => ({
      useIterator: contexts(
        ({ context }) => context?.iterator,
        'iterator',
      ),
      waiter: waiter(DELAY),
    }),
  );

  service.subscribe(state => console.log(state.value));

  describe('TESTS', () => {
    test(...start(0));

    test(...useIterator(0, 1));

    test(...waiter(5, 2));

    test(...useIterator(0, 3));

    test(...waiter(5, 4));

    test(...useIterator(1000, 5));

    test(...send('NEXT', 6));

    test(...useIterator(1000, 7));

    test(...waiter(10, 8));

    test(...useIterator(2000, 9));

    test(...waiter(20, 10));

    test(...useIterator(2000, 11));

    test(...send('NEXT', 12));

    test(...useIterator(2000, 13));

    test(...waiter(5, 14));

    test(...send('PAUSE', 15));

    test(...useIterator(2000, 16));

    test(...waiter(15, 17));

    test(...useIterator(2000, 18));

    test(...send('RESUME', 19));

    test(...useIterator(2000, 20));

    test(...waiter(2, 21));

    test(...useIterator(2000, 22));

    test(...waiter(3, 23));

    test(...useIterator(3000, 24));

    test(...waiter(10, 25));

    test(...useIterator(3000, 26));

    test(...send('NEXT', 27));

    test(...useIterator(3000, 28));

    test(...waiter(5, 29));

    test(...useIterator(3000, 30));

    test(...send('STOP', 31));

    test(...useIterator(3000, 32));

    test(...waiter(25, 33));

    test(...useIterator(3000, 34));

    test(...send('RESUME', 35));

    test(...useIterator(3000, 36));

    test(...waiter(25, 37));

    test(...useIterator(3000, 38));

    test(...send('NEXT', 39));

    test(...useIterator(3000, 40));

    test(...waiter(10, 41));

    test(...useIterator(4000, 42));

    test(...dispose(43));
  });
});
