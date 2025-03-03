import type {
  ChangeProperties,
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

expectTypeOf<{
  user: string;
  password: string;
}>().toMatchTypeOf<PrimitiveObject>();
