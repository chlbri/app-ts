import { interpret } from '#interpreter';
import { constructTests } from '../fixtures';
import { DELAY } from './constants';
import { machine1 } from './machine1';

vi.useFakeTimers();

describe('src/interpreters/__tests__/data/machine1.test.ts', () => {
  const service1 = interpret(machine1);

  const { useContext, useIterator, useWaiter, start, stop, dispose } =
    constructTests(
      service1,
      ({ constructContexts, constructWaiter }) => ({
        useWaiter: constructWaiter(DELAY),
        useContext: constructContexts(({ context }) => context),

        useIterator: constructContexts(
          ({ context }) => context?.iterator,
          'iterator',
        ),
      }),
      1,
    );

  test(...useContext());
  test(...start());
  test(...useIterator(0));
  test(...useWaiter());
  test(...useIterator(1));
  test(...useWaiter());
  test(...useIterator(2));
  test(...useWaiter(8));
  test(...useIterator(10));
  test(...stop());
  test(...dispose());
});
