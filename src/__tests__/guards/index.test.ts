import { interpret } from '#interpreter';
import { constructTests, defaultC } from '#fixtures';
import { transformEventArg, ALWAYS_EVENT } from '#events';
import _machine1 from './index.1.machine';
import _machine2 from './index.2.machine';
import _machine3 from './index.3.machine';
import _machine4 from './index.4.machine';

describe('Interpret for guards', () => {
  const guard1 = vi.fn().mockReturnValue(defaultC);
  describe('#00 => isDefinedS coverage', () => {
    const machine = _machine1;

    machine.addOptions(({ isDefined }) => ({
      guards: {
        guard1: isDefined('events.payload'),
      },
    }));

    const service = interpret(machine);

    const { start, useStateValue } = constructTests(service);

    test(...start());
    test(...useStateValue('state2'));
  });

  describe('#01 => string', () => {
    const machine = _machine2;

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
        guards: {
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
    const machine = _machine3;

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
        guards: {
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
    const machine = _machine4;

    machine.addOptions(({ isDefined, isNotDefined }) => ({
      guards: {
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
