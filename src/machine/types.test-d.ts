import type { machine1, machine2 } from '#fixturesData';
import type { SingleOrArrayL } from '#types';
import type { types } from '@bemedev/types';
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

type GEFC2 = GetEventsFromMachine<typeof machine2>;
expectTypeOf<GEFC2>().toEqualTypeOf<{
  NEXT: types.PrimitiveObject;
  FINISH: types.PrimitiveObject;
  FETCH: types.PrimitiveObject;
  WRITE: types.PrimitiveObject;
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
  { config: unknown; context: string }
>;

expectTypeOf<Sub2>().branded.toEqualTypeOf<{
  events: typeof EVENTS_FULL | SingleOrArrayL<{}>;
  contexts?: never;
}>();
