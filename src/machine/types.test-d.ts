import type { Fn } from '@bemedev/types';
import type { machine2 } from 'src/interpreters/__tests__/activities.test.data';
import type { FnMapFrom2, Subscriber2 } from './types';

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
    data: string;
  }
>();
