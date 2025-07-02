import { createTests } from '@bemedev/vitest-extended';
import { config2, machine1 } from '~fixturesData';
import { DEFAULT_SERVICE } from '~interpreter';
import { DEFAULT_MACHINE } from '~machine';
import { typings } from './typings';
import { typingsExtended, typingsMachine } from './typings.extended';

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
      const actual = typings.number.type;
      expect(actual).toStrictEqual(expected);
    });

    test('#02 => string', () => {
      const actual = typings.string.type;
      expect(actual).toStrictEqual(expected);
    });

    test('#03 => boolean', () => {
      const actual = typings.boolean.type;
      expect(actual).toStrictEqual(expected);
    });

    test('#04 => object', () => {
      const actual = typings.emptyO.type;
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
      const actual = typings.array.typings();
      expect(actual).toStrictEqual(expected);
    });

    test('#08 => tuple', () => {
      const actual = typings.tuple.typings(1, 2, 3);
      expect(actual).toStrictEqual(expected);
    });

    test('#09 => function', () => {
      const actual = typings.function(typings());
      expect(actual).toStrictEqual(expected);
    });
  });

  describe('#03 => Machine related', () => {
    describe('#01 => interpret', () => {
      test('#01 => Typings - with value', () => {
        const actual = typingsExtended.interpret(machine1);
        expect(actual).toStrictEqual(expected);
      });

      test('#02 => Typings - without value', () => {
        const actual = typingsExtended.interpret();
        expect(actual).toStrictEqual(expected);
      });

      test('#03 => default', () => {
        const actual = typingsExtended.interpret.default;
        expect(actual).toStrictEqual(DEFAULT_SERVICE);
      });
    });

    describe('#02 => Machines', () => {
      describe('#01 => constants', () => {
        test('#01 => default', () => {
          const actual = typingsMachine.default;
          expect(actual).toStrictEqual(DEFAULT_MACHINE);
        });
      });
    });

    describe('#03 => config', () => {
      const { acceptation, success } = createTests(typings.config.typings);

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

  describe('#05 => Events and Promises helpers', () => {
    test('#01 => promiseDef', () => {
      const thenValue = ['data'];
      const catchValue = new Error('error');
      const actual = typings.promiseDef(thenValue, catchValue);
      expect(actual).toEqual({
        then: thenValue,
        catch: catchValue,
      });
    });

    test('#02 => toEventsR', () => {
      const events = {
        FETCH: { id: typings.string.type },
      };
      const promisees = {
        fetch: {
          then: typings.array(typings.string.type),
          catch: typings.emptyO,
        },
      };
      const actual = typings.toEventsR(events, promisees);
      expect(actual).toEqual(expected);
    });

    test('#03 => toEvents', () => {
      const events = {
        FETCH: { id: typings.string.type },
      };
      const promisees = {
        fetch: {
          then: typings.array(typings.string.type),
          catch: typings.emptyO,
        },
      };
      const actual = typings.toEvents(events, promisees);
      expect(actual).toEqual(expected);
    });
  });

  describe('#06 => Utility helpers', () => {
    test('#01 => undefiny', () => {
      const input = 'test';
      const actual = typings.undefiny(input);
      expect(actual).toBe(expected);
    });

    test('#02 => forceCast', () => {
      const input = { name: 'test' };
      const actual = typings.forceCast(input);
      expect(actual).toBe(input);
    });

    test('#03 => cast', () => {
      const input = { value: 42 };
      const actual = typings.cast(input);
      expect(actual).toBe(input);
    });

    test('#04 => any', () => {
      const actual = typings.any;
      expect(actual).toStrictEqual(expected);
    });
  });
});
