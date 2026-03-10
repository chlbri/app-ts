import { DEFAULT_MAX_TIME_PROMISE } from '#constants';
import { constructTests, defaultC, defaultT } from '#fixtures';
import { DELAY } from '#fixturesData';
import { interpret } from '#interpreter';
import { createMachine } from '#machine';

vi.useFakeTimers();
describe('#05 => Delay is not defined', () => {
  const machine = createMachine(
    {
      initial: 'idle',
      states: {
        idle: {
          after: {
            DELAY: '/active',
          },
        },
        active: {},
      },
    },
    defaultT,
  );
  const service = interpret(machine, defaultC);

  const { useStateValue, useWaiter, start, useWarnings } = constructTests(
    service,
    ({ waiter }) => ({
      useWaiter: waiter(DELAY),
    }),
  );

  test(...start());
  test(...useStateValue('idle'));
  test(...useWaiter(DEFAULT_MAX_TIME_PROMISE * 3));
  test(...useStateValue('idle'));
  describe(...useWarnings('Delay (DELAY) is not defined'));
});
