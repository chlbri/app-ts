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

expectTypeOf<TT1>().toMatchTypeOf<GuardConfig>();
expectTypeOf<FromGuard<TT1>>().toEqualTypeOf<'exists'>();

expectTypeOf<TT2>().not.toMatchTypeOf<GuardConfig>();
expectTypeOf<TT3>().not.toMatchTypeOf<GuardConfig>();

expectTypeOf<TT4>().toMatchTypeOf<GuardConfig>();
expectTypeOf<FromGuard<TT4>>().toEqualTypeOf<'check'>();

expectTypeOf<TT5>().toMatchTypeOf<GuardConfig>();
expectTypeOf<FromGuard<TT5>>().toEqualTypeOf<never>();

expectTypeOf<TT6>().toMatchTypeOf<GuardConfig>();
expectTypeOf<FromGuard<TT6>>().toEqualTypeOf<
  'check' | 'exists' | 'exists2'
>();

expectTypeOf<TT7>().not.toMatchTypeOf<GuardConfig>();
expectTypeOf<TT8>().not.toMatchTypeOf<GuardConfig>();

expectTypeOf<TT9>().toMatchTypeOf<GuardConfig>();
expectTypeOf<FromGuard<TT9>>().toEqualTypeOf<'exists2'>();
