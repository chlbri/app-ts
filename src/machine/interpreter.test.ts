import { t } from '@bemedev/types';
import { machine1 } from './__tests__/fixtures';
import { interpret, type AnyInterpreter } from './interpreter';

describe('Interpreter', () => {
  describe('#1 => Status', () => {
    let service = t.anify<AnyInterpreter>();

    test('#0 => Create the machine', () => {
      service = interpret(machine1, {
        pContext: { data: 'avion' },
        context: { age: 5 },
      }) as any;
    });

    test('#1 => The machine is at "status: idle"', () => {
      const actual = service.status;
      expect(actual).toBe('starting');
    });

    test('#2 => Start the machine', () => {
      service.start();
    });

    describe('#3 => The machine is started', () => {
      test('#1 => The machine is at "status: busy"', () => {
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
});
