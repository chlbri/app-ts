import { DEFAULT_MAX_TIME_PROMISE } from '#constants';
import { constructTests, defaultC } from '#fixtures';
import { interpret } from '#interpreter';
import { createFakeWaiter } from '@bemedev/vitest-extended';
import { machine } from './constants';

vi.useFakeTimers();
describe('Delay is too long', () => {
  const activity1 = vi.fn().mockReturnValue(defaultC);

  machine.addOptions(() => ({
    actions: {
      activity1,
    },
    delays: {
      DELAY: DEFAULT_MAX_TIME_PROMISE * 1.5,
    },
  }));

  const service = interpret(machine);
  const { useStateValue, start, stop } = constructTests(service);

  test(...start());
  test(...useStateValue('state1', 1));

  test('#03 => activity1 is not called', () => {
    expect(activity1).not.toBeCalled();
  });

  describe('#03 => Check the warnings', () => {
    test('#01 => Length of warnings', () => {
      expect(service._warningsCollector?.size).toBe(1);
    });

    test('#02 => Check the warning', () => {
      expect(service._warningsCollector).toContain(
        'Delay (DELAY) is too long',
      );
    });
  });

  test(...stop());
  test(...createFakeWaiter.all(vi)(6, DEFAULT_MAX_TIME_PROMISE * 2));
});
