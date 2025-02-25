import type { machine1, machine2 } from 'src/interpreters/__tests__/data';
import type { PrimitiveObject, SingleOrArrayL } from '~types';
import type {
  ContextFrom,
  EventsMapFrom,
  FnMapFrom2,
  GetEventsFromMachine,
  Subscriber,
} from './types';

type TT2 = keyof FnMapFrom2<typeof machine2>;
expectTypeOf<TT2>().toEqualTypeOf<
  | 'NEXT'
  | 'FINISH'
  | 'FETCH'
  | 'WRITE'
  | 'else'
  | 'machine$$then'
  | 'machine$$catch'
>;

type GEFC1 = GetEventsFromMachine<typeof machine2>;
expectTypeOf<GEFC1>().toMatchTypeOf<{
  NEXT: PrimitiveObject;
  FINISH: PrimitiveObject;
  FETCH: PrimitiveObject;
  WRITE: PrimitiveObject;
}>();

type Sub1 = Subscriber<
  EventsMapFrom<typeof machine2>,
  ContextFrom<typeof machine2>,
  typeof machine1
>;
expectTypeOf<Sub1>().branded.toEqualTypeOf<{
  events:
    | 'full'
    | SingleOrArrayL<
        | {
            NEXT?: SingleOrArrayL<'NEXT' | 'FINISH' | 'FETCH' | 'WRITE'>;
          }
        | 'NEXT'
        | 'FINISH'
        | 'FETCH'
        | 'WRITE'
      >;
  contexts: SingleOrArrayL<{
    iterator?: SingleOrArrayL<'iterator'>;
  }>;
}>();

type Sub2 = Subscriber<
  {},
  string,
  { preConfig: unknown; context: string }
>;
expectTypeOf<Sub2>().branded.toEqualTypeOf<{
  events: 'full' | SingleOrArrayL<{}>;
  contexts?: never;
}>();
