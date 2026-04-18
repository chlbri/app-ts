import { constructTests, defaultC } from '#fixtures';
import { interpret } from '#interpreter';
import { DELAY, machine } from './constants';

vi.useFakeTimers();
describe('delay is not defined', () => {
  const activity = vi.fn().mockReturnValue(defaultC);

  machine.addOptions(() => ({
    actions: {
      activity1: activity,
    },
  }));

  const service = interpret(machine);
  const { send, useStateValue, start, waiter } = constructTests(
    service,
    ({ waiter }) => ({ waiter: waiter(DELAY) }),
  );

  test(...start());
  test(...useStateValue('state1'));

  describe('#02 => Check the warnings', () => {
    test('#01 => Length of warnings', () => {
      expect(service._warningsCollector?.size).toBe(1);
    });

    test('#02 => Check the warning', () => {
      expect(service._warningsCollector).toContain(
        'Delay (DELAY) is not defined',
      );
    });
  });

  test('#03 => activity1 is not called', () => {
    expect(activity).not.toBeCalled();
  });

  test(...send('NEXT', 4));
  test(...useStateValue('state2', 5));

  test('#06 => add delay', () => {
    service.addOptions(() => ({
      delays: { DELAY },
    }));
  });

  test(...send('NEXT', 7));
  test(...useStateValue('state1', 8));
  test(...waiter());

  describe('#11 => Check Activity', () => {
    test('#01 => activity1 is called one time', () => {
      expect(activity).toHaveBeenCalledTimes(1);
    });

    test('#02 => activity1 is called with correct params', () => {
      expect(activity).toHaveBeenCalledWith({
        ...defaultC,
        event: { type: 'NEXT', payload: {} },
        status: 'busy',
        tags: undefined,
        value: 'state1',
      });
    });
  });
});
