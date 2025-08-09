import { interpret } from '#interpreter';
import { createMachine } from '#machine';
import { constructSend, constructValue, defaultC } from './fixtures';

describe('Interpret for actions', () => {
  const action1 = vi.fn().mockReturnValue(defaultC);
  describe('#01 => string', () => {
    const machine = createMachine(
      {
        states: {
          state1: {
            always: {
              actions: 'action1',
            },
          },
          state2: {
            on: {
              NEXT: {},
            },
          },
        },
      },
      {
        ...defaultC,
        eventsMap: {
          NEXT: {},
        },
        promiseesMap: {},
      },
      {
        initials: { '/': 'state1' },
        targets: {
          '/state1.always': '/state2',
          '/state2.on.NEXT': '/state1',
        },
      },
    );

    const service = interpret(machine, defaultC);
    const useValue = constructValue(service);
    const useSendNext = (index: number) =>
      constructSend(service)('NEXT', index);

    test('#01 => Start', () => {
      service.start();
    });

    test(...useValue('state2', 2));

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

    test(...useSendNext(5));

    describe('#05 => Check the action', () => {
      test('#01 => Called one time', () => {
        expect(action1).toHaveBeenCalledTimes(1);
      });

      test('#02 => Called with the correct arguments', () => {
        expect(action1).toHaveBeenCalledWith({
          pContext: {},
          context: {},
          event: { type: 'NEXT', payload: {} },
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
        states: {
          state1: {
            always: {
              actions: {
                name: 'action1',
                description: 'Just an action',
              },
            },
          },
          state2: {
            on: {
              NEXT: {},
            },
          },
        },
      },
      {
        ...defaultC,
        eventsMap: {
          NEXT: {},
        },
        promiseesMap: {},
      },
      {
        initials: { '/': 'state1' },
        targets: {
          '/state1.always': '/state2',
          '/state2.on.NEXT': '/state1',
        },
      },
    );

    const service = interpret(machine, defaultC);
    const useValue = constructValue(service);
    const useSendNext = (index: number) =>
      constructSend(service)('NEXT', index);

    test('#01 => Start', () => {
      service.start();
    });

    test(...useValue('state2', 2));

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

    test(...useSendNext(5));

    describe('#05 => Check the action', () => {
      test('#01 => Called one time', () => {
        expect(action1).toHaveBeenCalledTimes(1);
      });

      test('#02 => Called with the correct arguments', () => {
        expect(action1).toHaveBeenCalledWith({
          pContext: {},
          context: {},
          event: { type: 'NEXT', payload: {} },
          status: 'busy',
          tags: undefined,
          value: 'state1',
        });
      });
    });
  });
});
