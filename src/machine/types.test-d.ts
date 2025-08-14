import type { machine1, machine2 } from '#fixturesData';
import type { SingleOrArrayL } from '#types';
import type { types } from '@bemedev/types';
import type { EVENTS_FULL } from './constants';
import type {
  ConfigFrom,
  ContextFrom,
  EventsMapFrom,
  FnMapFrom,
  GetEventsFromMachine,
  GetTargetsFrom,
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

type Config1 = ConfigFrom<typeof machine1>;

type Targets1 = GetTargetsFrom<Config1>;

expectTypeOf<Targets1>().branded.toEqualTypeOf<{
  '/idle.on.NEXT'?: '/' | '/final' | '/idle' | '..' | '../';
}>();

type Config2 = ConfigFrom<typeof machine2>;

type Targets2 = GetTargetsFrom<Config2>;

expectTypeOf<Targets2>().branded.toEqualTypeOf<{
  '/idle.on.NEXT'?:
    | '/'
    | '/final'
    | '/idle'
    | '..'
    | '../'
    | '/working'
    | '/working/fetch/fetch'
    | '/working/fetch/idle'
    | '/working/ui/input'
    | '/working/ui/idle'
    | '/working/fetch'
    | '/working/ui'
    | '/working/ui/final';
  '/working.on.FINISH'?:
    | '/'
    | '/final'
    | '/idle'
    | '..'
    | '../'
    | '/working'
    | '/working/fetch/fetch'
    | '/working/fetch/idle'
    | '/working/ui/input'
    | '/working/ui/idle'
    | '/working/fetch'
    | '/working/ui'
    | '/working/ui/final'
    | './fetch'
    | './ui'
    | './fetch/fetch'
    | './fetch/idle'
    | './ui/input'
    | './ui/idle'
    | './ui/final';
  '/working/fetch/fetch.promises.then'?:
    | '/'
    | '/final'
    | '/idle'
    | '..'
    | '../'
    | '/working'
    | '/working/fetch/fetch'
    | '/working/fetch/idle'
    | '/working/ui/input'
    | '/working/ui/idle'
    | '/working/fetch'
    | '/working/ui'
    | '/working/ui/final'
    | '../fetch'
    | '../../'
    | '../../working';
  '/working/fetch/fetch.promises.catch'?:
    | '/'
    | '/final'
    | '/idle'
    | '..'
    | '../'
    | '/working'
    | '/working/fetch/fetch'
    | '/working/fetch/idle'
    | '/working/ui/input'
    | '/working/ui/idle'
    | '/working/fetch'
    | '/working/ui'
    | '/working/ui/final'
    | '../fetch'
    | '../../'
    | '../../working';
  '/working/fetch/idle.on.FETCH'?:
    | '/'
    | '/final'
    | '/idle'
    | '..'
    | '../'
    | '/working'
    | '/working/fetch/fetch'
    | '/working/fetch/idle'
    | '/working/ui/input'
    | '/working/ui/idle'
    | '/working/fetch'
    | '/working/ui'
    | '/working/ui/final'
    | '../fetch'
    | '../../'
    | '../../working';
  '/working/ui/input.on.WRITE.[0]'?:
    | '/'
    | '..'
    | '../'
    | '../../'
    | '/working'
    | '/final'
    | '/working/fetch/fetch'
    | '/working/fetch/idle'
    | '/working/ui/input'
    | '/working/ui/idle'
    | '/idle'
    | '/working/fetch'
    | '/working/ui'
    | '/working/ui/final'
    | '../../working'
    | '../ui';
  '/working/ui/input.on.WRITE.[1]'?:
    | '/'
    | '..'
    | '../'
    | '../../'
    | '/working'
    | '/final'
    | '/working/fetch/fetch'
    | '/working/fetch/idle'
    | '/working/ui/input'
    | '/working/ui/idle'
    | '/idle'
    | '/working/fetch'
    | '/working/ui'
    | '/working/ui/final'
    | '../../working'
    | '../ui';
  '/working/ui/idle.on.WRITE'?:
    | '/'
    | '..'
    | '../'
    | '../../'
    | '/working'
    | '/final'
    | '/working/fetch/fetch'
    | '/working/fetch/idle'
    | '/working/ui/input'
    | '/working/ui/idle'
    | '/idle'
    | '/working/fetch'
    | '/working/ui'
    | '/working/ui/final'
    | '../../working'
    | '../../'
    | '../'
    | '..'
    | '../ui';
}>();
