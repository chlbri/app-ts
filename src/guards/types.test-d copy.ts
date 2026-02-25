import type { FromGuard, GuardConfig } from './types';

type TT1 = 'exists';

type TT2 = 4;

type TT3 = {
  and: TT1;
};

type TT4 = 'check';

type TT5 = {
  or: [];
};

type TT6 = {
  or: [TT1, TT4, TT9];
};

type TT7 = {
  and: [TT6, TT2];
};

type TT8 = {
  or: [TT6, TT3, TT5];
};

type TT9 = { name: 'exists2'; description: 'description' };

expectTypeOf<TT1>().toExtend<GuardConfig>();
expectTypeOf<FromGuard<TT1>>().toEqualTypeOf<'exists'>();

expectTypeOf<TT2>().not.toExtend<GuardConfig>();
expectTypeOf<TT3>().not.toExtend<GuardConfig>();

expectTypeOf<TT4>().toExtend<GuardConfig>();
expectTypeOf<FromGuard<TT4>>().toEqualTypeOf<'check'>();

expectTypeOf<TT5>().toExtend<GuardConfig>();
expectTypeOf<FromGuard<TT5>>().toEqualTypeOf<never>();

expectTypeOf<TT6>().toExtend<GuardConfig>();
expectTypeOf<FromGuard<TT6>>().toEqualTypeOf<
  'check' | 'exists' | 'exists2'
>();

expectTypeOf<TT7>().not.toExtend<GuardConfig>();
expectTypeOf<TT8>().not.toExtend<GuardConfig>();

expectTypeOf<TT9>().toExtend<GuardConfig>();
expectTypeOf<FromGuard<TT9>>().toEqualTypeOf<'exists2'>();
