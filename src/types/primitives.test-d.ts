import type { ToEvents } from '~events';
import type {
  ChangeProperties,
  ConcatFnMap,
  ConcatKeys,
  FnMap2,
  KeyStrings,
  PrimitiveObject,
  Simplify,
} from '~types';

const ttString = 'str';
const ttNumber = 55;
const ttBoolean = true;
const ttArra1 = [1, 2, 3] as const;
const ttArray2 = [1, 2, 3];
const ttObject = { a: 1, b: 2, c: 3 } as const;
const ttFunction = () => {};
const ttArrowFunction = () => {};
const ttClass = class {};

const complexObject1 = {
  a: 1,
  b: 'str',
  c: true,
  d: [1, 2, 3, { a: 1, b: 2, c: 'str' }],
  e: { a: 1, b: 2, c: [3] },
};

class TC {}
const complexObject2 = {
  a: 1,
  b: 'str',
  c: true,
  d: [1, 2, 3, { a: 1, b: 2, c: 'str' }],
  e: { a: 1, b: 2, c: [3] },
  f: new TC(),
};

assertType<PrimitiveObject>(ttString);
assertType<PrimitiveObject>(ttNumber);
assertType<PrimitiveObject>(ttBoolean);
expectTypeOf(ttArra1).not.toMatchTypeOf<PrimitiveObject>();
expectTypeOf(ttArray2).not.toMatchTypeOf<PrimitiveObject>();
assertType<PrimitiveObject>(ttObject);
expectTypeOf(ttFunction).not.toMatchTypeOf<PrimitiveObject>();
expectTypeOf(ttArrowFunction).not.toMatchTypeOf<PrimitiveObject>();
expectTypeOf(ttClass).not.toMatchTypeOf<PrimitiveObject>();
assertType<PrimitiveObject>(complexObject1);
expectTypeOf(complexObject2).not.toMatchTypeOf<PrimitiveObject>();

type _TT1 = {
  arg1: {
    arg11: string;
    arg12: number;
  };
  arg2: number;
  arg3: {
    arg31: {
      arg311: string;
    };
  };
};

type TT11 = Simplify<KeyStrings<_TT1>>;
type TT12 = Simplify<ChangeProperties<_TT1, { arg1: { arg11: 'ert11' } }>>;
type TT13 = Simplify<
  ChangeProperties<
    _TT1,
    { arg1: { arg11: 'ert11'; '@my': 'ert1' }; arg3: { '@my': 'ert3' } }
  >
>;

assertType<TT11>({
  arg1: {
    arg11: 'example',
    arg12: 'str',
    '@my': 'yyt',
  },
  arg2: 'str',
  arg3: {
    arg31: {
      arg311: 'example',
      '@my': 'yyt',
    },
    '@my': 'yyt',
  },
});

assertType<TT11>({
  arg1: {
    arg11: 'example',
    arg12: '42',
    '@my': 'yyt',
  },
  arg2: '100',
  arg3: {
    // @ts-expect-error Test typing
    arg31: {
      arg311: 'example',
    },
    '@my': 'yyt',
  },
});

assertType<TT12>({
  arg1: { arg12: 45, ert11: 'string' },
  arg2: 5,
  arg3: {
    arg31: { arg311: 'string' },
  },
});

assertType<TT13>({
  ert1: { arg12: 45, ert11: 'string' },
  arg2: 5,
  ert3: {
    arg31: { arg311: 'string' },
  },
});

type CK1 = { first: 'first'; third: 'third' };
type CK2 = { second: 'second'; fourth: 'fourth' };

expectTypeOf<ConcatKeys<CK1, CK2>>().toEqualTypeOf<{
  'first&&second': ['first', 'second'];
  'first&&fourth': ['first', 'fourth'];
  'third&&second': ['third', 'second'];
  'third&&fourth': ['third', 'fourth'];
}>();

type Cfm1 = FnMap2<
  {
    event1: {
      data1: string;
    };
    event2: {
      data2: number;
    };
  },
  { user: string; password: string },
  number
>;

type Cfm2 = FnMap2<
  {
    event3: {
      data3: boolean;
    };
    event4: {
      data4: string;
    };
  },
  { login: string; pwd: string }
>;

expectTypeOf<{
  user: string;
  password: string;
}>().toMatchTypeOf<PrimitiveObject>();

type Cfm = ConcatFnMap<Cfm1, Cfm2>;

type CfmT = {
  'event1&&event3': (
    contexts: [
      {
        user: string;
        password: string;
      },
      {
        login: string;
        pwd: string;
      },
    ],
    map: [
      {
        data1: string;
      },
      {
        data3: boolean;
      },
    ],
  ) => number;

  'event1&&event4': (
    contexts: [
      {
        user: string;
        password: string;
      },
      {
        login: string;
        pwd: string;
      },
    ],
    map: [
      {
        data1: string;
      },
      {
        data4: string;
      },
    ],
  ) => number;
  'event2&&event3': (
    contexts: [
      {
        user: string;
        password: string;
      },
      {
        login: string;
        pwd: string;
      },
    ],
    map: [
      {
        data2: number;
      },
      {
        data3: boolean;
      },
    ],
  ) => number;

  'event2&&event4': (
    contexts: [
      {
        user: string;
        password: string;
      },
      {
        login: string;
        pwd: string;
      },
    ],
    map: [
      {
        data2: number;
      },
      {
        data4: string;
      },
    ],
  ) => number;
  else: (
    contexts: [
      {
        user: string;
        password: string;
      },
      {
        login: string;
        pwd: string;
      },
    ],
    map: [
      ToEvents<{
        event1: {
          data1: string;
        };
        event2: {
          data2: number;
        };
      }>,
      ToEvents<{
        event3: {
          data3: boolean;
        };
        event4: {
          data4: string;
        };
      }>,
    ],
  ) => number;
};

expectTypeOf<Cfm>().toMatchTypeOf<CfmT>();
expectTypeOf<keyof Cfm>().toEqualTypeOf<
  | 'event1&&event3'
  | 'event1&&event4'
  | 'event2&&event3'
  | 'event2&&event4'
  | 'else'
>();
