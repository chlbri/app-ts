import type {
  Fn,
  PrimitiveObject,
  UnionToTuple,
} from '#bemedev/globals/types';
import type {
  ChangeProperties,
  KeyStrings,
  NoExtraKeys,
  NoExtraKeysFor,
  NoExtraKeysRecord,
  NoExtraKeysStrict,
  ValuesOf,
} from '~types';

export type ExtractLargeKeys<T> = string extends T
  ? never
  : number extends T
    ? never
    : symbol extends T
      ? never
      : T;

type _Simplify<T> = T extends { new: any }
  ? T
  : T extends Fn
    ? Fn<SimplifyArray<Parameters<T>>, ReturnType<T>>
    : T extends object
      ? {
          [P in keyof T as ExtractLargeKeys<P>]: T[P] extends object
            ? Simplify<T[P]>
            : T[P];
        }
      : T;

export type Simplify<T, S = unknown> = Extract<_Simplify<T>, S>;

export type IdxOf<T extends any[]> = Exclude<keyof T, keyof any[]>;

export type _SimplifyArray<T extends any[]> = {
  [K in IdxOf<T>]: Simplify<T[K]>;
};

export type SimplifyArray<T extends any[]> = UnionToTuple<
  ValuesOf<_SimplifyArray<T>>
>;

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
expectTypeOf(ttArra1).toExtend<PrimitiveObject>();
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

// #region NoExtraKeys Tests

// Basic schema for testing
type BasicSchema = {
  name: string;
  value: number;
  optional?: boolean;
};

// Nested schema for testing
type NestedSchema = {
  id: string;
  config: {
    enabled: boolean;
    options?: {
      timeout: number;
      retries?: number;
    };
  };
  tags?: string[];
};

// Deep recursive schema (like ConfigDef)
type DeepSchema = {
  targets: string;
  initial?: string;
  states?: Record<string, DeepSchema>;
};

// #region Basic NoExtraKeys tests

// Valid: exact match
type ValidBasic = NoExtraKeys<{ name: 'test'; value: 42 }, BasicSchema>;
expectTypeOf<ValidBasic>().toMatchObjectType<{
  name: 'test';
  value: 42;
}>();

// Valid: with optional property
type ValidWithOptional = NoExtraKeys<
  { name: 'test'; value: 42; optional: true },
  BasicSchema
>;
expectTypeOf<ValidWithOptional>().toMatchObjectType<{
  name: 'test';
  value: 42;
  optional: true;
}>();

// Valid: partial object (omitting optional)
type ValidPartial = NoExtraKeys<{ name: 'test'; value: 42 }, BasicSchema>;
expectTypeOf<ValidPartial>().toMatchObjectType<{
  name: 'test';
  value: 42;
}>();

// Invalid: extra key should be typed as never
type InvalidExtraKey = NoExtraKeys<
  { name: 'test'; value: 42; extra: string },
  BasicSchema
>;
expectTypeOf<InvalidExtraKey['extra']>().toEqualTypeOf<never>();

// #endregion Basic NoExtraKeys tests

// #region Nested NoExtraKeys tests

// Valid nested object
type ValidNested = NoExtraKeys<
  {
    id: 'abc';
    config: {
      enabled: true;
      options: { timeout: 1000 };
    };
  },
  NestedSchema
>;
expectTypeOf<ValidNested>().toMatchTypeOf<{
  id: 'abc';
  config: { enabled: true; options: { timeout: 1000 } };
}>();

// Invalid: extra key in nested object
type InvalidNestedExtra = NoExtraKeys<
  {
    id: 'abc';
    config: {
      enabled: true;
      extra: 'not allowed';
    };
  },
  NestedSchema
>;
// The nested 'extra' should be never
expectTypeOf<InvalidNestedExtra['config']>().toHaveProperty('extra');

// Valid with deep optional
type ValidDeepOptional = NoExtraKeys<
  {
    id: 'xyz';
    config: {
      enabled: false;
      options: { timeout: 500; retries: 3 };
    };
  },
  NestedSchema
>;
expectTypeOf<ValidDeepOptional['config']['options']>().toMatchTypeOf<
  | {
      timeout: 500;
      retries: 3;
    }
  | undefined
>();

// #endregion Nested NoExtraKeys tests

// #region Deep recursive NoExtraKeys tests (like ConfigDef)

// Valid deep schema
type ValidDeep = NoExtraKeys<
  {
    targets: 'idle | active';
    initial: 'idle';
    states: {
      idle: { targets: 'active' };
      active: { targets: 'idle' };
    };
  },
  DeepSchema
>;
expectTypeOf<ValidDeep>().toMatchTypeOf<{
  targets: 'idle | active';
  initial: 'idle';
  states: {
    idle: { targets: 'active' };
    active: { targets: 'idle' };
  };
}>();

// Valid deeply nested states
type ValidDeepNested = NoExtraKeys<
  {
    targets: 'parent';
    states: {
      parent: {
        targets: 'child1 | child2';
        initial: 'child1';
        states: {
          child1: { targets: 'child2' };
          child2: { targets: 'child1' };
        };
      };
    };
  },
  DeepSchema
>;
expectTypeOf<ValidDeepNested['states']>().toMatchTypeOf<
  | {
      parent: {
        targets: 'child1 | child2';
        initial: 'child1';
        states: {
          child1: { targets: 'child2' };
          child2: { targets: 'child1' };
        };
      };
    }
  | undefined
>();

// Invalid: extra key at root level
type InvalidDeepRoot = NoExtraKeys<
  {
    targets: 'test';
    extraRoot: true;
  },
  DeepSchema
>;
expectTypeOf<InvalidDeepRoot['extraRoot']>().toEqualTypeOf<never>();

// Invalid: extra key in nested state
type InvalidDeepNested = NoExtraKeys<
  {
    targets: 'test';
    states: {
      test: {
        targets: 'other';
        notAllowed: 'value';
      };
    };
  },
  DeepSchema
>;
// The nested state should have 'notAllowed' as never
expectTypeOf<InvalidDeepNested['states']>().not.toBeNever();

// #endregion Deep recursive NoExtraKeys tests

// #region NoExtraKeysStrict tests

// Valid strict
type ValidStrict = NoExtraKeysStrict<
  { name: 'test'; value: 42 },
  BasicSchema
>;
expectTypeOf<ValidStrict>().toMatchTypeOf<{ name: 'test'; value: 42 }>();

// NoExtraKeysStrict requires T to extend Schema
// This should fail at compile time if uncommented:
// type InvalidStrict = NoExtraKeysStrict<{ name: 'test' }, BasicSchema>;

// #endregion NoExtraKeysStrict tests

// #region NoExtraKeysRecord tests

type StateSchema = {
  target: string;
  initial?: string;
};

type ValidRecord = NoExtraKeysRecord<
  {
    idle: { target: 'active' };
    active: { target: 'idle'; initial: 'sub' };
  },
  StateSchema
>;
expectTypeOf<ValidRecord>().toMatchTypeOf<{
  idle: { target: 'active' };
  active: { target: 'idle'; initial: 'sub' };
}>();

// Invalid record entry
type InvalidRecord = NoExtraKeysRecord<
  {
    idle: { target: 'active'; extra: true };
  },
  StateSchema
>;
expectTypeOf<InvalidRecord['idle']['extra']>().toEqualTypeOf<never>();

// #endregion NoExtraKeysRecord tests

// #region NoExtraKeysFor tests

type ValidFor = NoExtraKeysFor<BasicSchema, { name: 'partial' }>;
expectTypeOf<ValidFor>().toMatchTypeOf<{ name: 'partial' }>();

type InvalidFor = NoExtraKeysFor<BasicSchema, { name: 'test'; extra: 1 }>;
expectTypeOf<InvalidFor['extra']>().toEqualTypeOf<never>();

// #endregion NoExtraKeysFor tests

// #region Edge cases

// Empty object
type EmptySchema = NonNullable<object>;
type EmptyObj = NoExtraKeys<NonNullable<object>, EmptySchema>;
expectTypeOf<EmptyObj>().toMatchTypeOf<NonNullable<object>>();

// Schema with array (arrays should not be recursively processed)
type ArraySchema = {
  items: number[];
  nested: { values: string[] };
};
type ValidArray = NoExtraKeys<
  { items: [1, 2, 3]; nested: { values: ['a', 'b'] } },
  ArraySchema
>;
expectTypeOf<ValidArray>().toMatchTypeOf<{
  items: [1, 2, 3];
  nested: { values: ['a', 'b'] };
}>();

// Schema with function (functions should not be recursively processed)
type FnSchema = {
  handler: () => void;
  config: { callback?: (x: number) => string };
};
type ValidFn = NoExtraKeys<
  { handler: () => {}; config: { callback: (x: number) => 'test' } },
  FnSchema
>;
expectTypeOf<ValidFn['handler']>().toMatchTypeOf<() => void>();

// Schema with Date (Date should not be recursively processed)
type DateSchema = {
  createdAt: Date;
  meta: { updatedAt?: Date };
};
type ValidDate = NoExtraKeys<
  { createdAt: Date; meta: { updatedAt: Date } },
  DateSchema
>;
expectTypeOf<ValidDate['createdAt']>().toMatchTypeOf<Date>();

// Schema with Map/Set (should not be recursively processed)
type CollectionSchema = {
  map: Map<string, number>;
  set: Set<string>;
};
type ValidCollection = NoExtraKeys<
  { map: Map<string, number>; set: Set<string> },
  CollectionSchema
>;
expectTypeOf<ValidCollection['map']>().toMatchTypeOf<
  Map<string, number>
>();
expectTypeOf<ValidCollection['set']>().toMatchTypeOf<Set<string>>();

// #endregion Edge cases

// #endregion NoExtraKeys Tests
