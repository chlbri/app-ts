import numberT from '#bemedev/features/numbers/typings';
import stringT from '#bemedev/features/strings/typings';
import { interpret } from '#interpreter';
import { createMachine } from '#machine';
import { constructTests, defaultC, defaultT } from '#fixtures';
import { transformEventArg, ALWAYS_EVENT } from '#events';

describe('Interpret for guards', () => {
  const guard1 = vi.fn().mockReturnValue(defaultC);
  describe('#00 => isDefinedS coverage', () => {
    const machine = createMachine(
      {
        initial: 'state1',
        states: {
          state1: {
            always: {
              guards: 'guard1',
              target: '/state2',
            },
          },
          state2: {},
        },
      },
      defaultT,
    );

    machine.addOptions(({ isDefined }) => ({
      predicates: {
        guard1: isDefined('events.payload'),
      },
    }));

    const service = interpret(machine);

    const { start, useStateValue } = constructTests(service);

    test(...start());
    test(...useStateValue('state2'));
  });

  describe('#01 => string', () => {
    const machine = createMachine(
      {
        initial: 'state1',
        states: {
          state1: {
            always: {
              guards: 'guard1',
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
    const { useStateValue, send, start } = constructTests(service);

    test(...start(1));

    test(...useStateValue('state2', 2));

    describe('#03 => Check the warnings', () => {
      test('#01 => Length of warnings', () => {
        expect(service._warningsCollector?.size).toBe(1);
      });

      test('#02 => Check the warning', () => {
        expect(service._warningsCollector).toContain(
          'Predicate (guard1) is not defined',
        );
      });
    });

    test('#04 => add guard', () => {
      service.addOptions(() => ({
        predicates: {
          guard1,
        },
      }));
    });

    test(...send('NEXT', 5));

    describe('#05 => Check the action', () => {
      test('#01 => Called one time', () => {
        expect(guard1).toHaveBeenCalledTimes(1);
      });

      test('#02 => Called with the correct arguments', () => {
        expect(guard1).toHaveBeenCalledWith({
          ...defaultC,
          event: transformEventArg(ALWAYS_EVENT),
          status: 'busy',
          tags: undefined,
          value: 'state1',
        });
      });
    });

    afterAll(() => {
      guard1.mockClear();
    });
  });

  describe('#02 => describer', () => {
    const machine = createMachine(
      {
        initial: 'state1',
        states: {
          state1: {
            always: {
              guards: { name: 'guard1', description: 'Just a guard' },
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
    const { useStateValue, send, start } = constructTests(service);

    test(...start(1));

    test(...useStateValue('state2', 2));

    describe('#03 => Check the warnings', () => {
      test('#01 => Length of warnings', () => {
        expect(service._warningsCollector?.size).toBe(1);
      });

      test('#02 => Check the warning', () => {
        expect(service._warningsCollector).toContain(
          'Predicate (guard1) is not defined',
        );
      });
    });

    test('#04 => add guard', () => {
      service.addOptions(() => ({
        predicates: {
          guard1,
        },
      }));
    });

    test(...send('NEXT', 5));

    describe('#06 => Check the action', () => {
      test('#01 => Called one time', () => {
        expect(guard1).toHaveBeenCalledTimes(1);
      });

      test('#02 => Called with the correct arguments', () => {
        expect(guard1).toHaveBeenCalledWith({
          ...defaultC,
          event: transformEventArg(ALWAYS_EVENT),
          status: 'busy',
          tags: undefined,
          value: 'state1',
        });
      });
    });

    afterAll(() => {
      guard1.mockClear();
    });
  });

  describe('#03 => And/Or', () => {
    const machine = createMachine(
      {
        initial: 'state1',
        states: {
          state1: {
            always: {
              guards: [
                'returnTrue',
                {
                  or: [
                    'returnFalse',
                    {
                      and: [
                        {
                          name: 'returnTrue',
                          description: 'Just return TRUE',
                        },
                        'returnTrue2',
                      ],
                    },
                    {
                      name: 'returnFalse2',
                      description: 'Just a guard',
                    },
                  ],
                },
              ],
              target: '/state2',
            },
          },
          state2: {},
        },
      },
      {
        ...defaultT,
        context: {
          data: numberT.type,
        },
        pContext: {
          data: stringT.type,
        },
      },
    );

    machine.addOptions(({ isDefined, isNotDefined }) => ({
      predicates: {
        returnFalse: isNotDefined('events'),
        returnFalse2: isDefined('events.type'),
        returnTrue: true,
        returnTrue2: isDefined('pContext.data'),
      },
    }));

    const service = interpret(machine, {
      context: { data: 5 },
      pContext: { data: 'avion' },
    });
    const { useStateValue, start } = constructTests(service);

    test(...start(1));

    test(...useStateValue('state2', 2));
  });
});
