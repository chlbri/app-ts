import type { Decompose3 } from './expandFnMap';

type _DD = {
  pContext: { a: string; b: number };
  context: { c: boolean; d: { e: string } };
};

// #region type DD1
type DD1 = Decompose3<_DD>;

expectTypeOf<DD1>().toEqualTypeOf<{
  'pContext.a': string;
  'pContext.b': number;
  'context.c': boolean;
  'context.d.e': string;
}>();
// #endregion

// #region type DD2
type DD2 = Decompose3<_DD, { parent: true; sep: '/' }>;

type _DD2 = {
  pContext: {
    a: string;
    b: number;
  };
  context: {
    c: boolean;
    d: {
      e: string;
    };
  };
  'context/d': {
    e: string;
  };
  'pContext/a': string;
  'pContext/b': number;
  'context/c': boolean;
  'context/d/e': string;
};

expectTypeOf<DD2>().toEqualTypeOf<_DD2>();
// #endregion

// #region type DD3
type DD3 = Decompose3<_DD, { sep: ':' }>;

expectTypeOf<DD3>().toEqualTypeOf<{
  'pContext:a': string;
  'pContext:b': number;
  'context:c': boolean;
  'context:d:e': string;
}>();
// #endregion
