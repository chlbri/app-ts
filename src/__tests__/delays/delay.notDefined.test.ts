import { DEFAULT_MAX_TIME_PROMISE } from '#constants';
import { constructTests, defaultC } from '#fixtures';
import { interpret } from '#interpreter';
import machine from './delay.notDefined.machine';

vi.useFakeTimers();
describe('#05 => Delay is not defined', () => {
  
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
