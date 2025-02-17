import type { Fn } from '@bemedev/types';
import type {
  machine1,
  machine2,
} from 'src/interpreters/__tests__/test.data';
import type { PrimitiveObject, Simplify, SingleOrArrayL } from '~types';
import type {
  ContextFrom,
  EventsMapFrom,
  FnMapFrom2,
  GetEventsFromMachine,
  Subscriber,
  Subscriber2,
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

type FT = Extract<
  Subscriber2<
    { event1: { data: string } },
    { data: string },
    typeof machine2
  >,
  Fn
>;

expectTypeOf<FT>().toMatchTypeOf<
  (
    contexts: [
      {
        data: string;
      },
      {
        iterator: number;
        input: string;
        data: string[];
      },
    ],
    map: [
      (
        | 'machine$$init'
        | 'machine$$always'
        | {
            type: 'machine$$then';
            payload: any;
          }
        | {
            type: 'machine$$catch';
            payload: any;
          }
        | 'machine$$exceeded'
        | {
            type: 'event1';
            payload: {
              data: string;
            };
          }
      ),
      (
        | 'machine$$init'
        | 'machine$$always'
        | {
            type: 'machine$$then';
            payload: any;
          }
        | {
            type: 'machine$$catch';
            payload: any;
          }
        | 'machine$$exceeded'
        | {
            type: 'NEXT';
            payload: {};
          }
        | {
            type: 'FINISH';
            payload: {};
          }
        | {
            type: 'FETCH';
            payload: {};
          }
        | {
            type: 'WRITE';
            payload: {
              value: string;
            };
          }
      ),
    ],
  ) => {
    data?: string;
  }
>();

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
expectTypeOf<Sub1>().toEqualTypeOf<{
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

type Sub2 = Simplify<
  Subscriber<{}, string, { preConfig: unknown; context: string }>
>;
expectTypeOf<Sub2>().toEqualTypeOf<{
  events: 'full' | SingleOrArrayL<{}>;
  contexts: true;
}>();
