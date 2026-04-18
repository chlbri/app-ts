import { OptionalDefinition } from '~types';

type O<T> = OptionalDefinition<T, 'value'>;

expectTypeOf<O<string>>().toEqualTypeOf<{ value: string }>();
expectTypeOf<O<string | undefined>>().toEqualTypeOf<{ value?: string }>();
expectTypeOf<O<number>>().toEqualTypeOf<{ value: number }>();

expectTypeOf<O<Partial<{ name: string; age: number }>>>().toEqualTypeOf<{
  value: Partial<{
    name: string;
    age: number;
  }>;
}>();

expectTypeOf<O<{ name: string; age?: number }>>().toEqualTypeOf<{
  value: {
    name: string;
    age?: number;
  };
}>();

expectTypeOf<
  O<{ name: string; age?: number; sex: string }>
>().toEqualTypeOf<{
  value: {
    name: string;
    age?: number;
    sex: string;
  };
}>();

expectTypeOf<
  O<{ name?: string; age?: number; sex: string }>
>().toEqualTypeOf<{
  value: {
    name?: string;
    age?: number;
    sex: string;
  };
}>();

expectTypeOf<
  O<{ name?: string; age?: number; sex?: string }>
>().toEqualTypeOf<{
  value: {
    name?: string;
    age?: number;
    sex?: string;
  };
}>();

expectTypeOf<
  O<{
    name?: string;
    age?: number;
    sex?: string;
    data: { ert: string; esp?: boolean };
  }>
>().toEqualTypeOf<{
  value: {
    name?: string;
    age?: number;
    sex?: string;
    data: { ert: string; esp?: boolean };
  };
}>();
