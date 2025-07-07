import type { machine1, machine2 } from 'src/interpreters/__tests__/data';
import type { PrimitiveObject, SingleOrArrayL } from '~types';
import type { EVENTS_FULL } from './constants';
import type {
  ContextFrom,
  EventsMapFrom,
  FnMapFrom,
  GetEventsFromMachine,
  PromiseesMapFrom,
  SubscriberType,
} from './types';

type TT2 = keyof FnMapFrom<typeof machine2>;
expectTypeOf<TT2>().toEqualTypeOf<
  'NEXT' | 'FINISH' | 'FETCH' | 'WRITE' | 'else'
>;

type GEFC1 = GetEventsFromMachine<typeof machine2>;
expectTypeOf<GEFC1>().toMatchTypeOf<{
  NEXT: PrimitiveObject;
  FINISH: PrimitiveObject;
  FETCH: PrimitiveObject;
  WRITE: PrimitiveObject;
}>();

type Sub1 = SubscriberType<
  EventsMapFrom<typeof machine2>,
  PromiseesMapFrom<typeof machine2>,
  ContextFrom<typeof machine2>,
  typeof machine1
>;

expectTypeOf<Sub1>().branded.toEqualTypeOf<{
  events:
    | typeof EVENTS_FULL
    | SingleOrArrayL<
        | {
            NEXT?: SingleOrArrayL<
              | 'NEXT'
              | 'FINISH'
              | 'FETCH'
              | 'WRITE'
              | 'fetch::then'
              | 'fetch::catch'
            >;
          }
        | 'NEXT'
        | 'FINISH'
        | 'FETCH'
        | 'WRITE'
        | 'fetch::then'
        | 'fetch::catch'
      >;
  contexts: SingleOrArrayL<{
    iterator?: SingleOrArrayL<'iterator'>;
  }>;
}>();

type Sub2 = SubscriberType<
  {},
  {},
  string,
  { preConfig: unknown; context: string }
>;

expectTypeOf<Sub2>().branded.toEqualTypeOf<{
  events: typeof EVENTS_FULL | SingleOrArrayL<{}>;
  contexts?: never;
}>();
