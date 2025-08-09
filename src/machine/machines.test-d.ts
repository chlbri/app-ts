import type { Decompose } from '@bemedev/decompose';
import type { types } from '@bemedev/types';

type TTT = Decompose<
  {
    states?:
      | Partial<{
          values: string;
          fields: string;
        }>
      | undefined;
    lang?: 'en' | 'es' | 'fr' | undefined;
    values?: Record<string, string> | undefined;
    fields?: string[] | undefined;
    responses?: types.SingleOrArray<string>[] | undefined;
  },
  {
    start: false;
    sep: '.';
    object: 'both';
  }
>;

expectTypeOf<TTT>().toEqualTypeOf<{
  [key: `values.${string}`]: string | undefined;
  [key: `fields.[${number}]`]: string | undefined;
  [key: `responses.[${number}]`]: types.SingleOrArray<string> | undefined;
  values: Record<string, string> | undefined;
  fields: string[] | undefined;
  states:
    | Partial<{
        values: string;
        fields: string;
      }>
    | undefined;
  lang: 'en' | 'es' | 'fr' | undefined;
  responses: types.SingleOrArray<string>[] | undefined;
  'states.values': string;
  'states.fields': string;
}>();
