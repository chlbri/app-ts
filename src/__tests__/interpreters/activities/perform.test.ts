import { DELAY } from '#fixturesData';
import { interpret } from '#interpreter';
import { constructTests } from '#fixtures';
import _raw_machine from './perform.machine';

vi.useFakeTimers();
describe('Performs activities on events', () => {
  const machine = _raw_machine.provideOptions(
    ({ assign, pauseActivity, resumeActivity, stopActivity }) => ({
      actions: {
        inc: assign(
          'context.iterator',
          ({ context }) => context?.iterator + 1,
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

  const service = interpret(machine, {
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

  test(...start(0));

  test(...useIterator(0, 1));

  test(...waiter(6, 2));

  test(...useIterator(6, 3));

  test(...send('PAUSE', 4));

  test(...useIterator(6, 5));

  test(...waiter(6, 6));

  test(...useIterator(6, 7));

  test(...send('RESUME', 8));

  test(...useIterator(6, 9));

  test(...waiter(6, 10));

  test(...useIterator(12, 11));

  test(...waiter(6, 12));

  test(...useIterator(18, 13));

  test(...send('STOP', 14));

  test(...useIterator(18, 15));

  test(...waiter(6, 16));

  test(...useIterator(18, 17));

  test(...send('RESUME', 18));

  test(...useIterator(18, 19));

  test(...waiter(6, 20));

  test(...useIterator(18, 21));

  test(...dispose(22));
});
