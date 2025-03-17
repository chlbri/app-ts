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

expectTypeOf(ttString).toExtend<PrimitiveObject>();
expectTypeOf(ttNumber).toExtend<PrimitiveObject>();
expectTypeOf(ttBoolean).toExtend<PrimitiveObject>();
expectTypeOf(ttArra1).not.toExtend<PrimitiveObject>();
expectTypeOf(ttArray2).toExtend<PrimitiveObject>();
expectTypeOf(ttObject).toExtend<PrimitiveObject>();
expectTypeOf(ttFunction).not.toExtend<PrimitiveObject>();
expectTypeOf(ttArrowFunction).not.toExtend<PrimitiveObject>();
expectTypeOf(ttClass).not.toExtend<PrimitiveObject>();
expectTypeOf(complexObject1).toExtend<PrimitiveObject>();
expectTypeOf(complexObject2).not.toExtend<PrimitiveObject>();

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

expectTypeOf({
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
}).toEqualTypeOf<TT11>();

expectTypeOf({
  arg1: {
    arg11: 'example',
    arg12: '42',
    '@my': 'yyt',
  },
  arg2: '100',
  arg3: {
    arg31: {
      arg311: 'example',
    },
    '@my': 'yyt',
  },
}).not.toExtend<TT11>();

expectTypeOf({
  arg1: { arg12: 45, ert11: 'string' },
  arg2: 5,
  arg3: {
    arg31: { arg311: 'string' },
  },
}).toEqualTypeOf<TT12>();

expectTypeOf({
  ert1: { arg12: 45, ert11: 'string' },
  arg2: 5,
  ert3: {
    arg31: { arg311: 'string' },
  },
}).toEqualTypeOf<TT13>();

expectTypeOf<{
  user: string;
  password: string;
}>().toExtend<PrimitiveObject>();

expectTypeOf<TT11>().toExtend<PrimitiveObject>();
expectTypeOf<TT13>().toExtend<PrimitiveObject>();
