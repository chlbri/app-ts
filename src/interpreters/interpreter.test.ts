import { t } from '@bemedev/types';
import { machine3 } from './__tests__/data/machine3';
import { interpret } from './interpreter';
import type { AnyInterpreter } from './interpreter.types';

describe('Interpreter', () => {
  const resultC = {
    pContext: { data: 'avion' },
    context: { age: 5 },
  };

  describe('#1 => Status', () => {
    let service = t.unknown<AnyInterpreter>();

    test('#0 => Create the machine', () => {
      service = t.any(interpret(machine3, resultC));
    });

    test('#1 => The machine is at "status: idle"', () => {
      const actual = service.status;
      expect(actual).toBe('starting');
    });

    test('#2 => Start the machine', () => {
      service.start();
    });

    describe('#3 => The machine is started', () => {
      test('#1 => The machine is at "status: working"', () => {
        const actual = service.status;
        expect(actual).toBe('working');
      });

      describe('#2 => Check the currentvalue', () => {
        const expected = {
          state1: {
            state11: 'state111',
          },
        };

        test("#1 => It's expected", () => {
          const actual = service.value;
          expect(actual).toStrictEqual(expected);
        });

        test("#2 => It's the same as the initial", () => {
          expect(service.initialValue).toStrictEqual(service.value);
        });
      });
    });
  });

  describe('#02 => Mode', () => {
    const service = interpret(machine3, {
      ...resultC,
    });

    test('#01 => mode is ""strict" by default', () => {
      expect(service.mode).toBe('strict');
    });

    test('@02 => Make it normal', () => {
      service.makeNormal();
    });

    test('03 => modde is "normal"', () => {
      expect(service.mode).toBe('normal');
    });

    test('@04 => Make it "strictest"', () => {
      service.makeStrictest();
    });

    test('03 => modde is "strictest"', () => {
      expect(service.mode).toBe('strictest');
    });
  });
});
