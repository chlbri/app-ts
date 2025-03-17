import type { Fn } from '@bemedev/types';
import { createTests } from '@bemedev/vitest-extended';
import { config2, machine1, machine2 } from '~fixturesData';
import { typings } from './typings';

describe('typings', () => {
  const expected = undefined;
  describe('#01 => Default', () => {
    test('#01 => Without data', () => {
      const actual = typings();
      expect(actual).toStrictEqual(expected);
    });

    test('#02 => With data', () => {
      const actual = typings('any');
      expect(actual).toStrictEqual(expected);
    });
  });

  describe('#02 => Type helpers', () => {
    test('#01 => number', () => {
      const actual = typings.number();
      expect(actual).toStrictEqual(expected);
    });

    test('#02 => string', () => {
      const actual = typings.string();
      expect(actual).toStrictEqual(expected);
    });

    test('#03 => boolean', () => {
      const actual = typings.boolean();
      expect(actual).toStrictEqual(expected);
    });

    test('#04 => object', () => {
      const actual = typings.object;
      expect(actual).toStrictEqual(expected);
    });

    test('#05 => partial', () => {
      const actual = typings.partial();
      expect(actual).toStrictEqual(expected);
    });

    test('#06 => deepPartial', () => {
      const actual = typings.deepPartial();
      expect(actual).toStrictEqual(expected);
    });

    test('#07 => array', () => {
      const actual = typings.array();
      expect(actual).toStrictEqual(expected);
    });

    test('#08 => tuple', () => {
      const actual = typings.tuple(1, 2, 3);
      expect(actual).toStrictEqual(expected);
    });

    test('#09 => function', () => {
      const actual = typings.function(typings());
      expect(actual).toStrictEqual(expected);
    });
  });

  describe('#03 => Machine related', () => {
    describe('#01 => interpret', () => {
      const actual = typings.interpret(machine1);
      expect(actual).toStrictEqual(expected);
    });

    test('#02 => machine', () => {
      const actual = typings.machine(machine2);
      expect(actual).toStrictEqual(expected);
    });

    describe('#03 => createMachine', () => {
      const { acceptation, success } = createTests(
        typings.createMachine as unknown as Fn,
      );

      describe('#00 => Acceptation', acceptation);

      describe(
        '#01 => Success',
        success({
          invite: 'Machine 2',
          parameters: [
            config2,
            {
              eventsMap: {
                NEXT: {},
                FETCH: {},
                WRITE: { value: typings.string() },
                FINISH: {},
              },
              context: typings<{
                iterator: number;
                input: string;
                data: string[];
              }>(),
              pContext: typings<{ iterator: number }>(),
              promiseesMap: {
                fetch: {
                  then: typings.array(typings.string()),
                  catch: typings.object,
                },
              },
            },
            {
              '/': 'idle',
              '/working/fetch': 'idle',
              '/working/ui': 'idle',
            },
          ],
          expected,
        }),
      );
    });

    describe('#03 => config', () => {
      const { acceptation, success } = createTests(typings.config);

      describe('#00 => Acceptation', acceptation);

      describe(
        '#01 => Success',
        success(
          {
            invite: 'Empty',
            // @ts-expect-error for test
            expected,
          },
          {
            invite: 'Config 2',
            parameters: config2,
            expected,
          },
        ),
      );
    });
  });

  describe('#04 => Primitives and special types', () => {
    test('#01 => date', () => {
      const actual = typings.date;
      expect(actual).toStrictEqual(expected);
    });

    test('#02 => null', () => {
      const actual = typings.null;
      expect(actual).toStrictEqual(expected);
    });

    test('#03 => undefined', () => {
      const actual = typings.undefined;
      expect(actual).toStrictEqual(expected);
    });

    test('#04 => rn', () => {
      const actual = typings.rn;
      expect(actual).toStrictEqual(expected);
    });

    test('#05 => ru', () => {
      const actual = typings.ru;
      expect(actual).toStrictEqual(expected);
    });

    test('#06 => ra', () => {
      const actual = typings.ra;
      expect(actual).toStrictEqual(expected);
    });

    test('#07 => symbol', () => {
      const actual = typings.symbol;
      expect(actual).toStrictEqual(expected);
    });

    test('#08 => bigint', () => {
      const actual = typings.bigint;
      expect(actual).toStrictEqual(expected);
    });

    describe('#09 => never', () => {
      test('#01 => not throw', () => {
        expect(() => typings.never).not.toThrow();
      });

      describe('#02 => return an error', () => {
        const actual = typings.never;
        test('#01 => type is Error', () => {
          expect(actual).toBeInstanceOf(Error);
        });

        test('#02 => message is "This is a never type"', () => {
          expect(actual).toHaveProperty('message', 'This is a never type');
        });
      });
    });

    describe('#10 => NotUndefined', () => {
      test('#01 => Without value', () => {
        const actual = typings.notUndefined();
        expect(actual).toStrictEqual(expected);
      });

      test('#02 => With value', () => {
        const actual = typings.notUndefined('test' as string | undefined);
        expect(actual).toStrictEqual(expected);
      });
    });

    test('#11 => With value', () => {
      const actual = typings.notUndefined('test' as string | undefined);
      expect(actual).toStrictEqual(expected);
    });
  });
});
