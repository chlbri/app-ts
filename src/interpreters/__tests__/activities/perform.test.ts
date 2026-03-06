import tupleOf from '#bemedev/features/arrays/castings/tuple';
import { DELAY } from '#fixturesData';
import { interpret } from '#interpreter';
import { createMachine } from '#machine';
import { typings } from '#utils';
import { fakeWaiter } from 'src/fixtures';

vi.useFakeTimers();
describe('Performs activities on events', () => {
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
