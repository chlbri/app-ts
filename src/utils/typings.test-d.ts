import {
  PARTIAL,
  PartialCustom,
  typings,
  type TransformPrimitiveObject,
  type inferT,
} from './typings';

describe('Typing utils', () => {
  describe('#01 => CustomPartial', () => {
    it('#01 => If contains "PARTIAL" value, it is a CustomPartial', () => {
      type TTT1 = {
        [PARTIAL]: undefined;
      } & {
        age: number;
      };

      expectTypeOf<TTT1>().toExtend<Partial<PartialCustom>>();
    });

    it('#02 => If not contains "PARTIAL" value, it is not a CustomPartial', () => {
      type TTT2 = {
        age: number;
      };

      expectTypeOf<TTT2>().not.toExtend<Partial<PartialCustom>>();
    });

    it('#03 => Test the strictly right type', () => {
      type TTT3 = {
        [PARTIAL]: undefined;
      };

      expectTypeOf<TTT3>().toExtend<Partial<PartialCustom>>();
    });

    it('#04 => should transform with "undefined" as string', () => {
      type TTT4 = TransformPrimitiveObject<{
        age: 'number';
        [PARTIAL]: 'undefined';
      }>;

      expectTypeOf<TTT4>().branded.toEqualTypeOf<{
        age: number;
        '$$app-ts => partial$$'?: undefined;
      }>();
    });

    it('#05 => should transform with "undefined" as number', () => {
      type TTT5 = inferT<{
        [PARTIAL]: undefined;
        age: 'number';
      }>;

      expectTypeOf<TTT5>().toEqualTypeOf<{
        age?: number;
      }>();
    });
  });

  describe('#02 => complex', () => {
    const point = typings.any({
      x: 'number',
      y: 'number',
    });

    const nodeJSON = typings.any({
      position: point,
      data: {
        label: typings.maybe('string'),
        content: 'string',
      },
      input: 'boolean',
    });

    test('#01 =>', () => {
      const pC = {
        nodes: typings.maybe(
          typings.array(typings.intersection(nodeJSON, { id: 'string' })),
        ),
      };

      expectTypeOf<inferT<typeof pC>>().toEqualTypeOf<{
        nodes?: Array<{
          position: { x: number; y: number };
          data: { label?: string; content: string };
          input: boolean;
          id: string;
        }>;
      }>();
    });
  });

  describe('#03 => Nested arrays and tuples', () => {
    it('#01 => Array of objects', () => {
      const arr = typings.array({ id: 'number', value: 'string' });

      expectTypeOf<inferT<typeof arr>>().toEqualTypeOf<
        Array<{ id: number; value: string }>
      >();
    });

    it('#02 => Tuple with mixed types', () => {
      const tup = typings.tuple('string', 'number', 'boolean');

      expectTypeOf<inferT<typeof tup>>().toEqualTypeOf<
        [string, number, boolean]
      >();
    });

    it('#03 => Tuple with Maybe types', () => {
      const tup = typings.tuple(
        'string',
        typings.maybe('number'),
        'boolean',
      );

      expectTypeOf<inferT<typeof tup>>().toEqualTypeOf<
        [string, number | undefined, boolean]
      >();
    });

    it('#04 => Array of Maybe primitives', () => {
      const arr = typings.array(typings.maybe('string'));

      expectTypeOf<inferT<typeof arr>>().toEqualTypeOf<
        Array<string | undefined>
      >();
    });

    it('#05 => Tuple with nested objects', () => {
      const tup = typings.tuple(
        { x: 'number', y: 'number' },
        { name: 'string', age: 'number' },
      );

      expectTypeOf<inferT<typeof tup>>().toEqualTypeOf<
        [{ x: number; y: number }, { name: string; age: number }]
      >();
    });

    it('#06 => Array of array primitive', () => {
      const arr = typings.array(typings.array('number'));

      expectTypeOf<inferT<typeof arr>>().toEqualTypeOf<number[][]>();
    });
  });

  describe('#04 => Deep nesting and recursion', () => {
    it('#01 => Deeply nested objects', () => {
      const deep = typings.any({
        level1: {
          level2: {
            level3: {
              level4: {
                value: 'string',
              },
            },
          },
        },
      });

      expectTypeOf<inferT<typeof deep>>().toEqualTypeOf<{
        level1: {
          level2: {
            level3: {
              level4: {
                value: string;
              };
            };
          };
        };
      }>();
    });

    it('#02 => Deeply nested with Maybe and arrays', () => {
      const complex = typings.any({
        users: typings.array({
          id: 'string',
          profile: typings.maybe({
            avatar: typings.maybe('string'),
            bio: 'string',
          }),
        }),
      });

      expectTypeOf<inferT<typeof complex>>().toEqualTypeOf<{
        users: {
          id: string;
          profile?: {
            avatar?: string;
            bio: string;
          };
        }[];
      }>();
    });

    it('#03 => Multiple nested intersections', () => {
      const user = typings.intersection(
        { id: 'string', name: 'string' },
        { age: 'number', email: 'string' },
      );

      expectTypeOf<inferT<typeof user>>().toEqualTypeOf<{
        id: string;
        name: string;
        age: number;
        email: string;
      }>();
    });
  });

  describe('#05 => Edge cases with primitives', () => {
    it('#01 => All primitive types', () => {
      const allPrimitives = typings.any({
        str: 'string',
        num: 'number',
        bool: 'boolean',
      });

      expectTypeOf<inferT<typeof allPrimitives>>().toEqualTypeOf<{
        str: string;
        num: number;
        bool: boolean;
      }>();
    });

    it('#01b => All special primitive types', () => {
      const specialPrimitives = typings.any({
        nul: 'null',
        undef: 'undefined',
        sym: 'symbol',
      });

      type Result = inferT<typeof specialPrimitives>;

      expectTypeOf<Result>().toEqualTypeOf<{
        nul: null;
        undef?: undefined;
        sym: symbol;
      }>();
    });

    it('#02 => Maybe with all primitives', () => {
      const maybes = typings.any({
        str: typings.maybe('string'),
        num: typings.maybe('number'),
        bool: typings.maybe('boolean'),
      });

      expectTypeOf<inferT<typeof maybes>>().toEqualTypeOf<{
        str?: string;
        num?: number;
        bool?: boolean;
      }>();
    });

    it('#03 => Array of primitives', () => {
      const arrays = typings.any({
        strings: typings.array('string'),
        numbers: typings.array('number'),
        booleans: typings.array('boolean'),
      });

      expectTypeOf<inferT<typeof arrays>>().toEqualTypeOf<{
        strings: string[];
        numbers: number[];
        booleans: boolean[];
      }>();
    });
  });

  describe('#06 => Union and discriminated unions', () => {
    it('#01 => Simple union', () => {
      const union = typings.union(
        { type: 'string', value: 'string' },
        { type: 'string', value: 'number' },
      );

      expectTypeOf<inferT<typeof union>>().toEqualTypeOf<
        { type: string; value: string } | { type: string; value: number }
      >();
    });

    it('#02 => Discriminated union with type field', () => {
      const discriminated = typings.discriminatedUnion(
        'kind',
        { kind: 'string', value: 'string' },
        { kind: 'string', count: 'number' },
        { kind: typings.litterals('string'), flag: 'boolean' },
      );

      expectTypeOf<inferT<typeof discriminated>>().toEqualTypeOf<
        | { kind: string; value: string }
        | { kind: string; count: number }
        | { kind: 'string'; flag: boolean }
      >();
    });

    it('#03 => Union with Maybe types', () => {
      const unionMaybe = typings.union(
        { type: 'string', optional: typings.maybe('string') },
        { type: 'string', optional: typings.maybe('number') },
      );

      expectTypeOf<inferT<typeof unionMaybe>>().toEqualTypeOf<
        | { type: string; optional?: string }
        | { type: string; optional?: number }
      >();
    });
  });

  describe('#07 => Partial and optional combinations', () => {
    it('#01 => Partial object with nested fields', () => {
      const partial = typings.any({
        [PARTIAL]: undefined,
        id: 'string',
        name: 'string',
        age: 'number',
      });

      expectTypeOf<inferT<typeof partial>>().toEqualTypeOf<{
        id?: string;
        name?: string;
        age?: number;
      }>();
    });

    it('#02 => Partial with Maybe fields', () => {
      const partialMaybe = typings.any({
        [PARTIAL]: undefined,
        required: 'string',
        optional: typings.maybe('number'),
      });

      expectTypeOf<inferT<typeof partialMaybe>>().toEqualTypeOf<{
        required?: string;
        optional?: number;
      }>();
    });

    it('#03 => Nested partial objects', () => {
      const nestedPartial = typings.any({
        outer: {
          [PARTIAL]: undefined,
          inner: 'string',
          nested: 'number',
        },
      });

      expectTypeOf<inferT<typeof nestedPartial>>().toEqualTypeOf<{
        outer: {
          inner?: string;
          nested?: number;
        };
      }>();
    });

    it('#04 => Array of partial objects', () => {
      const arrPartial = typings.array({
        [PARTIAL]: undefined,
        id: 'string',
        name: 'string',
      });

      expectTypeOf<inferT<typeof arrPartial>>().toEqualTypeOf<
        Array<{
          id?: string;
          name?: string;
        }>
      >();
    });
  });

  describe('#08 => Custom types and literals', () => {
    it('#01 => Literal types with union', () => {
      const status = typings.litterals('pending', 'success', 'error');

      expectTypeOf<inferT<typeof status>>().toEqualTypeOf<
        'pending' | 'success' | 'error'
      >();
    });

    it('#02 => Number literals', () => {
      const code = typings.litterals(200, 404, 500);

      expectTypeOf<inferT<typeof code>>().toEqualTypeOf<200 | 404 | 500>();
    });

    it('#03 => Boolean literals', () => {
      const flag = typings.litterals(true, false);

      expectTypeOf<inferT<typeof flag>>().toEqualTypeOf<true | false>();
    });

    it('#04 => Literal in object', () => {
      const obj = typings.any({
        status: typings.litterals('active', 'inactive'),
        code: 'number',
      });

      expectTypeOf<inferT<typeof obj>>().toEqualTypeOf<{
        status: 'active' | 'inactive';
        code: number;
      }>();
    });

    it('#05 => Custom type wrapper', () => {
      const custom = typings.custom<{ special: string }>();

      expectTypeOf<inferT<typeof custom>>().toEqualTypeOf<{
        special: string;
      }>();
    });

    it('#06 => Date custom type', () => {
      const dateType = typings.custom<Date>();
      type Result = inferT<typeof dateType>;

      // Verify it's assignable to Date
      expectTypeOf<Date>().toEqualTypeOf<Result>();
      expectTypeOf<Result>().toEqualTypeOf<Date>();
    });

    it('#07 => Date in object', () => {
      const objWithDate = typings.any({
        id: 'string',
        createdAt: typings.custom<Date>(),
        updatedAt: typings.custom<Date>(),
      });

      type Result = inferT<typeof objWithDate>;

      // Verify structure
      expectTypeOf<Result['id']>().toEqualTypeOf<string>();
      expectTypeOf<Result['createdAt']>().toEqualTypeOf<Date>();
      expectTypeOf<Result['updatedAt']>().toEqualTypeOf<Date>();
    });

    it('#08 => Array of Date', () => {
      const dateArray = typings.array(typings.custom<Date>());
      type Result = inferT<typeof dateArray>;

      // Verify it's an array that accepts Date
      expectTypeOf<Date[]>().toEqualTypeOf<Result>();
    });

    it('#09 => Maybe Date', () => {
      const maybeDate = typings.maybe(typings.custom<Date>());
      type Result = inferT<typeof maybeDate>;

      // Verify it can be Date or undefined
      expectTypeOf<Date | undefined>().toEqualTypeOf<Result>();
    });

    it('#10 => AbortController custom type', () => {
      const controller = typings.custom<AbortController>();
      type Result = inferT<typeof controller>;

      // Verify it's assignable to AbortController
      expectTypeOf<AbortController>().toEqualTypeOf<Result>();
      expectTypeOf<Result>().toEqualTypeOf<AbortController>();
    });

    it('#11 => Mixed native types in object', () => {
      const nativeTypes = typings.any({
        id: 'string',
        signal: typings.custom<AbortSignal>(),
        controller: typings.maybe(typings.custom<AbortController>()),
        timestamp: typings.custom<Date>(),
        pattern: typings.custom<RegExp>(),
      });

      type Result = inferT<typeof nativeTypes>;

      // Verify each field
      expectTypeOf<Result['id']>().toEqualTypeOf<string>();
      expectTypeOf<Result['signal']>().toEqualTypeOf<AbortSignal>();
      expectTypeOf<Result['controller']>().toEqualTypeOf<
        AbortController | undefined
      >();
      expectTypeOf<Result['timestamp']>().toEqualTypeOf<Date>();
      expectTypeOf<Result['pattern']>().toEqualTypeOf<RegExp>();
    });

    it('#12 => Array of mixed native types', () => {
      const arr = typings.array({
        date: typings.custom<Date>(),
        value: 'number',
      });

      type Result = inferT<typeof arr>;

      // Verify structure matches
      expectTypeOf<Result[number]['value']>().toEqualTypeOf<number>();
      expectTypeOf<Result[number]['date']>().toEqualTypeOf<Date>();
    });

    it('#13 => Tuple with native types', () => {
      const tuple = typings.tuple(
        'string',
        typings.custom<Date>(),
        typings.custom<RegExp>(),
        'number',
      );

      type Result = inferT<typeof tuple>;

      // Verify tuple structure
      expectTypeOf<Result[0]>().toEqualTypeOf<string>();
      expectTypeOf<Result[1]>().toEqualTypeOf<Date>();
      expectTypeOf<Result[2]>().toEqualTypeOf<RegExp>();
      expectTypeOf<Result[3]>().toEqualTypeOf<number>();
    });

    it('#14 => Union with native types', () => {
      const union = typings.union(
        { type: 'string', value: 'string' },
        { type: 'string', value: typings.custom<Date>() },
        { type: 'string', value: 'number' },
      );

      type Result = inferT<typeof union>;

      // Verify union structure exists
      expectTypeOf<Result>().toEqualTypeOf<
        | { type: string; value: string }
        | { type: string; value: Date }
        | { type: string; value: number }
      >();
    });

    it('#15 => Intersection with native types', () => {
      const intersect = typings.intersection(
        {
          id: 'string',
          createdAt: typings.custom<Date>(),
        },
        {
          name: 'string',
          signal: typings.custom<AbortSignal>(),
        },
      );

      type Result = inferT<typeof intersect>;

      // Verify all fields
      expectTypeOf<Result['id']>().toEqualTypeOf<string>();
      expectTypeOf<Result['name']>().toEqualTypeOf<string>();
      expectTypeOf<Result['createdAt']>().toEqualTypeOf<Date>();
      expectTypeOf<Result['signal']>().toEqualTypeOf<AbortSignal>();
    });

    it('#16 => Error type', () => {
      const errorType = typings.custom<Error>();
      type Result = inferT<typeof errorType>;

      // Verify Error type
      expectTypeOf<Error>().toEqualTypeOf<Result>();
    });

    it('#17 => Promise type', () => {
      const promiseType = typings.custom<Promise<string>>();
      type Result = inferT<typeof promiseType>;

      // Verify Promise type
      expectTypeOf<Promise<string>>().toEqualTypeOf<Result>();
    });

    it('#18 => Map and Set types', () => {
      const obj = typings.any({
        map: typings.custom<Map<string, number>>(),
        set: typings.custom<Set<string>>(),
      });

      type Result = inferT<typeof obj>;

      // Verify Map and Set
      expectTypeOf<Result['map']>().toEqualTypeOf<Map<string, number>>();
      expectTypeOf<Result['set']>().toEqualTypeOf<Set<string>>();
    });

    it('#19 => Nested native types in complex structure', () => {
      const complex = typings.any({
        events: typings.array({
          id: 'string',
          timestamp: typings.custom<Date>(),
          data: typings.maybe({
            controller: typings.custom<AbortController>(),
            signal: typings.custom<AbortSignal>(),
          }),
        }),
        metadata: {
          created: typings.custom<Date>(),
          pattern: typings.maybe(typings.custom<RegExp>()),
        },
      });

      type Result = inferT<typeof complex>;

      // Verify nested structure
      expectTypeOf<
        Result['events'][number]['id']
      >().toEqualTypeOf<string>();
      expectTypeOf<
        Result['events'][number]['timestamp']
      >().toEqualTypeOf<Date>();
      expectTypeOf<Result['metadata']['created']>().toEqualTypeOf<Date>();
      expectTypeOf<Result['metadata']['pattern']>().toEqualTypeOf<
        RegExp | undefined
      >();
    });

    it('#20 => WeakMap and WeakSet types', () => {
      const obj = typings.any({
        weakMap: typings.custom<WeakMap<object, string>>(),
        weakSet: typings.custom<WeakSet<object>>(),
      });

      type Result = inferT<typeof obj>;

      // Verify WeakMap and WeakSet
      expectTypeOf<Result['weakMap']>().toEqualTypeOf<
        WeakMap<object, string>
      >();
      expectTypeOf<Result['weakSet']>().toEqualTypeOf<WeakSet<object>>();
    });
  });

  describe('#09 => Intersection complexity', () => {
    it('#01 => Multiple intersections with overlapping keys', () => {
      const intersect = typings.intersection(
        { id: 'string', name: 'string' },
        { name: 'string', age: 'number' },
        { age: 'number', email: 'string' },
      );

      expectTypeOf<inferT<typeof intersect>>().toEqualTypeOf<{
        id: string;
        name: string;
        age: number;
        email: string;
      }>();
    });

    it('#02 => Intersection with Maybe fields', () => {
      const intersectMaybe = typings.intersection(
        { id: 'string', optional: typings.maybe('string') },
        { name: 'string', optional: typings.maybe('string') },
      );

      expectTypeOf<inferT<typeof intersectMaybe>>().toEqualTypeOf<{
        id: string;
        optional?: string;
        name: string;
      }>();
    });

    it('#03 => Intersection with nested objects', () => {
      const intersectNested = typings.intersection(
        {
          id: 'string',
          config: { theme: 'string' },
        },
        {
          name: 'string',
          settings: { lang: 'string' },
        },
      );

      expectTypeOf<inferT<typeof intersectNested>>().toEqualTypeOf<{
        id: string;
        config: { theme: string };
        name: string;
        settings: { lang: string };
      }>();
    });
  });

  describe('#10 => Record patterns', () => {
    it('#01 => Simple record with string values', () => {
      const rec = typings.record('string', 'a', 'b', 'c');

      expectTypeOf<inferT<typeof rec>>().toEqualTypeOf<{
        a: string;
        b: string;
        c: string;
      }>();
    });

    it('#02 => Record with object values', () => {
      const recObj = typings.record(
        { id: 'string', value: 'number' },
        'x',
        'y',
        'z',
      );

      expectTypeOf<inferT<typeof recObj>>().toEqualTypeOf<{
        x: { id: string; value: number };
        y: { id: string; value: number };
        z: { id: string; value: number };
      }>();
    });

    it('#03 => Record with nested object values', () => {
      const recNested = typings.record(
        { value: 'string', enabled: 'boolean' },
        'feature1',
        'feature2',
      );

      expectTypeOf<inferT<typeof recNested>>().toEqualTypeOf<{
        feature1: { value: string; enabled: boolean };
        feature2: { value: string; enabled: boolean };
      }>();
    });
  });

  describe('#11 => Complex real-world scenarios', () => {
    it('#01 => API response with pagination', () => {
      const apiResponse = typings.any({
        data: typings.array({
          id: 'string',
          attributes: {
            name: 'string',
            email: typings.maybe('string'),
            tags: typings.maybe(typings.array('string')),
          },
        }),
        meta: {
          page: 'number',
          perPage: 'number',
          total: 'number',
          hasNext: 'boolean',
        },
      });

      expectTypeOf<inferT<typeof apiResponse>>().toEqualTypeOf<{
        data: Array<{
          id: string;
          attributes: {
            name: string;
            email?: string;
            tags?: string[];
          };
        }>;
        meta: {
          page: number;
          perPage: number;
          total: number;
          hasNext: boolean;
        };
      }>();
    });

    it('#02 => Form state with validation', () => {
      const formState = typings.any({
        values: {
          username: 'string',
          email: 'string',
          age: typings.maybe('number'),
        },
        errors: typings.maybe(
          typings.record(typings.array('string'), 'username', 'email'),
        ),
        touched: typings.record('boolean', 'username', 'email', 'age'),
        isSubmitting: 'boolean',
      });

      expectTypeOf<inferT<typeof formState>>().toEqualTypeOf<{
        values: {
          username: string;
          email: string;
          age?: number;
        };
        errors?: {
          username: string[];
          email: string[];
        };
        touched: {
          username: boolean;
          email: boolean;
          age: boolean;
        };
        isSubmitting: boolean;
      }>();
    });

    it('#03 => State machine event map', () => {
      const eventMap = typings.any({
        FETCH: { url: 'string', method: 'string' },
        SUCCESS: { status: 'number', data: 'string' },
        ERROR: { message: 'string', code: 'number' },
        RETRY: typings.maybe({ attempt: 'number' }),
      });

      expectTypeOf<inferT<typeof eventMap>>().toEqualTypeOf<{
        FETCH: { url: string; method: string };
        SUCCESS: { status: number; data: string };
        ERROR: { message: string; code: number };
        RETRY?: {
          attempt: number;
        };
      }>();
    });

    it('#04 => GraphQL-like schema', () => {
      const userType = typings.any({
        id: 'string',
        name: 'string',
        posts: typings.array({
          id: 'string',
          title: 'string',
          content: typings.maybe('string'),
          comments: typings.maybe(
            typings.array({
              id: 'string',
              text: 'string',
              author: typings.maybe('string'),
            }),
          ),
        }),
      });

      expectTypeOf<inferT<typeof userType>>().toEqualTypeOf<{
        id: string;
        name: string;
        posts: Array<{
          id: string;
          title: string;
          content?: string;
          comments?: Array<{
            id: string;
            text: string;
            author?: string;
          }>;
        }>;
      }>();
    });
  });

  describe('#12 => Extreme edge cases', () => {
    it('#01 => Empty object', () => {
      const empty = typings.any({});

      expectTypeOf<inferT<typeof empty>>().toEqualTypeOf<{}>();
    });

    it('#02 => Object with only PARTIAL marker', () => {
      const onlyPartial = typings.any({
        [PARTIAL]: undefined,
      });

      expectTypeOf<inferT<typeof onlyPartial>>().toEqualTypeOf<{}>();
    });

    it('#03 => Deeply nested Maybe types', () => {
      const deepMaybe = typings.maybe(
        typings.maybe(typings.maybe('string')),
      );

      expectTypeOf<inferT<typeof deepMaybe>>().toEqualTypeOf<
        string | undefined
      >();
    });

    it('#04 => Array of Maybe array', () => {
      const arrMaybeArr = typings.array(
        typings.maybe(typings.array('number')),
      );

      expectTypeOf<inferT<typeof arrMaybeArr>>().toEqualTypeOf<
        Array<number[] | undefined>
      >();
    });

    it('#05 => Complex array with maybe and nested', () => {
      const complexArr = typings.array({
        id: 'string',
        nested: typings.maybe({
          deep: 'number',
        }),
      });

      expectTypeOf<inferT<typeof complexArr>>().toEqualTypeOf<
        Array<{
          id: string;
          nested?: { deep: number };
        }>
      >();
    });

    it('#06 => Union of arrays with different element types', () => {
      const unionArrays = typings.union(
        typings.array('string'),
        typings.array('number'),
        typings.array('boolean'),
      );

      expectTypeOf<inferT<typeof unionArrays>>().toEqualTypeOf<
        string[] | number[] | boolean[]
      >();
    });

    it('#07 => Tuple with all primitives and nested', () => {
      const megaTuple = typings.tuple(
        'string',
        'number',
        'boolean',
        { x: 'number', y: 'number' },
        typings.maybe('string'),
        typings.array('number'),
      );

      expectTypeOf<inferT<typeof megaTuple>>().toEqualTypeOf<
        [
          string,
          number,
          boolean,
          { x: number; y: number },
          string | undefined,
          number[],
        ]
      >();
    });

    it('#08 => Deeply nested Maybe in objects', () => {
      const deepMaybeObj = typings.any({
        level1: typings.maybe({
          level2: typings.maybe({
            value: 'string',
          }),
        }),
      });

      expectTypeOf<inferT<typeof deepMaybeObj>>().toEqualTypeOf<{
        level1?: {
          level2?: {
            value: string;
          };
        };
      }>();
    });

    it('#09 => Mixed array with primitive and object', () => {
      const mixed = typings.union('string', 'number', {
        id: 'string',
        value: 'number',
      });

      expectTypeOf<inferT<typeof mixed>>().toEqualTypeOf<
        string | number | { id: string; value: number }
      >();
    });

    it('#10 => Multiple levels of arrays', () => {
      const multiArr = typings.any({
        matrix: typings.array(typings.array('number')),
        cube: typings.array(typings.array(typings.array('number'))),
      });

      expectTypeOf<inferT<typeof multiArr>>().toEqualTypeOf<{
        matrix: number[][];
        cube: number[][][];
      }>();
    });
  });

  describe('#13 => Combined complex patterns', () => {
    it('#01 => Union of discriminated types with arrays', () => {
      const complexUnion = typings.discriminatedUnion(
        'type',
        {
          type: 'string',
          items: typings.array('string'),
          count: 'number',
        },
        {
          type: 'string',
          value: typings.maybe('number'),
          enabled: 'boolean',
        },
      );

      expectTypeOf<inferT<typeof complexUnion>>().toEqualTypeOf<
        | {
            type: string;
            items: string[];
            count: number;
          }
        | {
            type: string;
            value?: number;
            enabled: boolean;
          }
      >();
    });

    it('#02 => Intersection with partial and arrays', () => {
      const complexIntersect = typings.intersection(
        {
          id: 'string',
          tags: typings.array('string'),
        },
        {
          metadata: {
            [PARTIAL]: undefined,
            author: 'string',
            date: 'string',
          },
        },
      );

      expectTypeOf<inferT<typeof complexIntersect>>().toEqualTypeOf<{
        id: string;
        tags: string[];
        metadata: {
          author?: string;
          date?: string;
        };
      }>();
    });

    it('#03 => Nested tuples with complex structures', () => {
      const complexTuple = typings.tuple(
        typings.array({ id: 'string', name: 'string' }),
        {
          config: typings.maybe('string'),
          values: typings.tuple('number', 'number', 'number'),
        },
        typings.maybe(typings.array('boolean')),
      );

      expectTypeOf<inferT<typeof complexTuple>>().toEqualTypeOf<
        [
          Array<{ id: string; name: string }>,
          {
            config?: string;
            values: [number, number, number];
          },
          boolean[] | undefined,
        ]
      >();
    });

    it('#04 => Record with discriminated union values', () => {
      const recUnion = typings.record(
        typings.union(
          { status: 'string', message: 'string' },
          { code: 'number', details: typings.maybe('string') },
        ),
        'api1',
        'api2',
        'api3',
      );

      expectTypeOf<inferT<typeof recUnion>>().toEqualTypeOf<{
        api1:
          | { status: string; message: string }
          | { code: number; details?: string };
        api2:
          | { status: string; message: string }
          | { code: number; details?: string };
        api3:
          | { status: string; message: string }
          | { code: number; details?: string };
      }>();
    });

    it('#05 => Deeply nested with all features', () => {
      const ultimate = typings.any({
        users: typings.array(
          typings.intersection(
            {
              id: 'string',
              profile: {
                [PARTIAL]: undefined,
                name: 'string',
                bio: typings.maybe('string'),
              },
            },
            {
              settings: {
                theme: typings.litterals('light', 'dark'),
                notifications: 'boolean',
              },
            },
          ),
        ),
        metadata: typings.maybe({
          total: 'number',
          pages: typings.tuple('number', 'number'),
        }),
      });

      expectTypeOf<inferT<typeof ultimate>>().toEqualTypeOf<{
        users: Array<{
          id: string;
          profile: {
            name?: string;
            bio?: string;
          };
          settings: {
            theme: 'light' | 'dark';
            notifications: boolean;
          };
        }>;
        metadata?: {
          total: number;
          pages: [number, number];
        };
      }>();
    });
  });
});
