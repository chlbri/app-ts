import type { PrimitiveObject } from '#bemedev/globals/types';
import type { machine2 } from '#fixturesData';
import type {
  FnMapFrom,
  GetEventsFromMachine
} from './types2';

type TT2 = keyof FnMapFrom<typeof machine2>;
expectTypeOf<TT2>().toEqualTypeOf<
  'NEXT' | 'FINISH' | 'FETCH' | 'WRITE' | 'else'
>;

type GEFC2 = GetEventsFromMachine<typeof machine2>;
expectTypeOf<GEFC2>().toEqualTypeOf<{
  NEXT: PrimitiveObject;
  FINISH: PrimitiveObject;
  FETCH: PrimitiveObject;
  WRITE: PrimitiveObject;
}>();
