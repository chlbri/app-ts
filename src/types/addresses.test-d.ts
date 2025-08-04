import type { GetChildren, GetParents } from './addresses';

type TT1 = GetParents<'/parent/child/grandchild/grantchild'>;

expectTypeOf<TT1>().toEqualTypeOf<
  | '..'
  | '../'
  | '../../'
  | '../../../'
  | '../../../parent'
  | '../../child'
  | '../grandchild'
>();

type TT2 = GetChildren<
  '/parent/child/grandchild' | '/parent/child' | '/parent',
  '/parent'
>;

expectTypeOf<TT2>().toEqualTypeOf<'child/grandchild' | 'child'>();
