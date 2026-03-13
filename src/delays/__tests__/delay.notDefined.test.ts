import { DEFAULT_MAX_TIME_PROMISE } from '#constants';
import { constructTests, defaultC } from '#fixtures';
import { interpret } from '#interpreter';
import { createMachine } from '#machine';
import { typings } from '#utils';

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
    typings(),
  );
  const service = interpret(machine, defaultC);

  const { useStateValue, useWaiter, start, useWarnings } = constructTests(
    service,
    ({ waiter }) => ({
      useWaiter: waiter(DEFAULT_MAX_TIME_PROMISE * 3),
    }),
  );

  test(...start());
  test(...useStateValue('idle'));
  test(...useWaiter());
  test(...useStateValue('idle'));
  describe(...useWarnings('Delay (DELAY) is not defined'));
});
