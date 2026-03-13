import { ALWAYS_EVENT, transformEventArg } from '#events';
import { constructTests, defaultC, defaultT } from '#fixtures';
import { interpret } from '#interpreter';
import { createMachine } from '#machine';

describe('Interpret for actions', () => {
  const action1 = vi.fn().mockReturnValue(defaultC);
  describe('#01 => string', () => {
    const machine = createMachine(
      {
        initial: 'state1',
        states: {
          state1: {
            always: {
              actions: 'action1',
              target: '/state2',
            },
          },
          state2: {
            on: {
              NEXT: '/state1',
            },
          },
        },
      },
      {
        ...defaultT,
        eventsMap: {
          NEXT: {},
        },
      },
    );

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
    const machine = createMachine(
      {
        initial: 'state1',
        states: {
          state1: {
            always: {
              actions: {
                name: 'action1',
                description: 'Just an action',
              },
              target: '/state2',
            },
          },
          state2: {
            on: {
              NEXT: '/state1',
            },
          },
        },
      },
      {
        ...defaultT,
        eventsMap: {
          NEXT: {},
        },
      },
    );

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
