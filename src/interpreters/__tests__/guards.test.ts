import { t } from '@bemedev/types';
import { interpret } from '~interpreter';
import { createMachine } from '~machine';
import {
  constructSend,
  constructValue,
  defaultC,
  defaultT,
} from './fixtures';

describe('Interpret for guards', () => {
  const guard1 = vi.fn().mockReturnValue(defaultC);
  describe('#00 => isDefinedS coverage', () => {
    const machine = createMachine(
      {
        states: {
          state1: {
            always: {
              target: '/state2',
              guards: 'guard1',
            },
          },
          state2: {},
        },
      },
      defaultT,
      { '/': 'state1' },
    );

    machine.addOptions(({ isDefined }) => ({
      predicates: {
        guard1: isDefined('events.type'),
      },
    }));

    const service = interpret(machine, defaultC);
    const useValue = constructValue(service);

    test('#01 => Start', () => {
      service.start();
    });

    test(...useValue('state1', 2));
  });

  describe('#01 => string', () => {
    const machine = createMachine(
      {
        states: {
          state1: {
            always: {
              target: '/state2',
              guards: 'guard1',
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

    test(...useSendNext(5));

    describe('#05 => Check the action', () => {
      test('#01 => Called one time', () => {
        expect(guard1).toHaveBeenCalledTimes(1);
      });

      test('#02 => Called with the correct arguments', () => {
        expect(guard1).toHaveBeenCalledWith(
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
      guard1.mockClear();
    });
  });

  describe('#02 => describer', () => {
    const machine = createMachine(
      {
        states: {
          state1: {
            always: {
              target: '/state2',
              guards: { name: 'guard1', description: 'Just a guard' },
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

    test(...useSendNext(5));

    describe('#05 => Check the action', () => {
      test('#01 => Called one time', () => {
        expect(guard1).toHaveBeenCalledTimes(1);
      });

      test('#02 => Called with the correct arguments', () => {
        expect(guard1).toHaveBeenCalledWith(
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
      guard1.mockClear();
    });
  });

  describe('#03 => And/Or', () => {
    const machine = createMachine(
      {
        states: {
          state1: {
            always: {
              target: '/state2',
              guards: [
                'returnTrue',
                {
                  or: [
                    'returnFalse',
                    { and: ['returnTrue', 'returnTrue2'] },
                    'returnFalse2',
                  ],
                },
              ],
            },
          },
          state2: {},
        },
      },
      {
        ...defaultT,
        context: {
          data: t.number,
        },
        pContext: {
          data: t.string,
        },
      },
      { '/': 'state1' },
    );

    machine.addOptions(({ isDefined, isNotDefined }) => ({
      predicates: {
        returnFalse: isNotDefined('events'),
        returnFalse2: isDefined('events.type'),
        returnTrue: isDefined('context'),
        returnTrue2: isDefined('pContext.data'),
      },
    }));

    const service = interpret(machine, {
      context: { data: 5 },
      pContext: { data: 'avion' },
    });
    const useValue = constructValue(service);

    test('#01 => Start', () => {
      service.start();
    });

    test(...useValue('state2', 2));
  });
});
