import { ALWAYS_EVENT, transformEventArg } from '#events';
import { constructTests, defaultC } from '#fixtures';
import { interpret } from '#interpreter';
import _machine1 from './actions.1.machine';
import _machine2 from './actions.2.machine';

describe('Interpret for actions', () => {
  const action1 = vi.fn().mockReturnValue(defaultC);
  describe('#01 => string', () => {
    const machine = _machine1;

    const service = interpret(machine, defaultC);
    const { send, useStateValue, start } = constructTests(service);
    test(...start());
    test(...useStateValue('state2'));

    describe('#03 => Check the warnings', () => {
      test('#01 => Length of warnings', () => {
        expect(service._warningsCollector?.size).toBe(1);
      });

      test('#02 => Check the warning', () => {
        expect(service._warningsCollector).toContain(
          'Action (action1) is not defined',
        );
      });
    });

    test('#04 => add action', () => {
      service.addOptions(() => ({
        actions: {
          action1,
        },
      }));
    });

    test(...send('NEXT', 5));

    describe('#05 => Check the action', () => {
      test('#01 => Called one time', () => {
        expect(action1).toHaveBeenCalledTimes(1);
      });

      test('#02 => Called with the correct arguments', () => {
        expect(action1).toHaveBeenCalledWith({
          ...defaultC,
          event: transformEventArg(ALWAYS_EVENT),
          status: 'busy',
          tags: undefined,
          value: 'state1',
        });
      });
    });

    afterAll(() => {
      action1.mockClear();
    });
  });

  describe('#02 => describer', () => {
    const machine = _machine2;

    const service = interpret(machine, defaultC);
    const { send, useStateValue, start } = constructTests(service);
    test(...start());
    test(...useStateValue('state2'));

    describe('#02 => Check the warnings', () => {
      test('#01 => Length of warnings', () => {
        expect(service._warningsCollector?.size).toBe(1);
      });

      test('#02 => Check the warning', () => {
        expect(service._warningsCollector).toContain(
          'Action (action1) is not defined',
        );
      });
    });

    test('#03 => add action', () => {
      service.addOptions(() => ({
        actions: {
          action1,
        },
      }));
    });

    test(...send('NEXT', 4));

    describe('#05 => Check the action', () => {
      test('#01 => Called one time', () => {
        expect(action1).toHaveBeenCalledTimes(1);
      });

      test('#02 => Called with the correct arguments', () => {
        expect(action1).toHaveBeenCalledWith({
          ...defaultC,
          event: transformEventArg(ALWAYS_EVENT),
          status: 'busy',
          tags: undefined,
          value: 'state1',
        });
      });
    });
  });
});
