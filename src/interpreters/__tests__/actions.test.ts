import { interpret } from '~interpreter';
import { createMachine } from '~machine';
import { constructSend, constructValue, defaultC } from './fixtures';

describe('Interpret for actions', () => {
  const action1 = vi.fn().mockReturnValue(defaultC);
  describe('#01 => string', () => {
    const machine = createMachine(
      {
        states: {
          state1: {
            always: {
              target: '/state2',
              actions: 'action1',
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
        ...defaultC,
        eventsMap: {
          NEXT: {},
        },
        promiseesMap: {},
      },
      { '/': 'state1' },
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
        expect(service.warningsCollector?.size).toBe(1);
      });

      test('#02 => Check the warning', () => {
        expect(service.warningsCollector).toContain(
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
        expect(action1).toHaveBeenCalledWith(
          expect.toSatisfy(val => Object.keys(val).length === 0),
          expect.toSatisfy(val => Object.keys(val).length === 0),
          {
            type: 'NEXT',
            payload: {},
          },
        );
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
              target: '/state2',
              actions: {
                name: 'action1',
                description: 'Just an action',
              },
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
        ...defaultC,
        eventsMap: {
          NEXT: {},
        },
        promiseesMap: {},
      },
      { '/': 'state1' },
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
        expect(service.warningsCollector?.size).toBe(1);
      });

      test('#02 => Check the warning', () => {
        expect(service.warningsCollector).toContain(
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
        expect(action1).toHaveBeenCalledWith(
          expect.toSatisfy(val => Object.keys(val).length === 0),
          expect.toSatisfy(val => Object.keys(val).length === 0),
          {
            type: 'NEXT',
            payload: {},
          },
        );
      });
    });
  });
});
