import type { Unionize } from '@bemedev/types';
import type { MaxExceededEvent } from 'src/constants/events';

import type { PrimitiveObject } from '~types';
import type { ALWAYS_EVENT, INIT_EVENT } from './constants';

export type EventObject<T = any> = {
  type: string;
  payload?: T;
};

export type EventsMap = Record<string, PrimitiveObject>;

export type PromiseeDef = {
  then: any;
  catch: any;
};

export type PromiseeMap = Record<string, PromiseeDef>;

export type InitEvent = typeof INIT_EVENT;
export type AlwaysEvent = `${string}::${typeof ALWAYS_EVENT}`;

type _EventsR<T extends EventsMap> =
  Unionize<T> extends infer U
    ? U extends any
      ? { type: keyof U & string; payload: U[keyof U] }
      : never
    : never;

type _PromiseesR<T extends PromiseeMap> =
  Unionize<T> extends infer U extends PromiseeMap
    ? U extends any
      ?
          | {
              type: `${keyof U & string}::then`;
              payload: U[keyof U]['then'];
            }
          | {
              type: `${keyof U & string}::catch`;
              payload: U[keyof U]['catch'];
            }
      : never
    : never;

export type ToEventsR<E extends EventsMap, P extends PromiseeMap> =
  | _EventsR<E>
  | _PromiseesR<P>;

export type ToEvents<E extends EventsMap, P extends PromiseeMap> =
  | ToEventsR<E, P>
  | InitEvent
  | AlwaysEvent
  | MaxExceededEvent;

export type EventArg<E extends EventsMap, P extends PromiseeMap> =
  ToEventsR<E, P> extends infer To
    ? To extends EventObject
      ? object extends To['payload']
        ? To['type'] | To
        : To
      : never
    : never;

export type ToEventsMap<
  E extends EventsMap,
  P extends PromiseeMap,
  TT extends ToEventsR<E, P> = ToEventsR<E, P>,
> = {
  [key in keyof TT]: TT[key];
};
