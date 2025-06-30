import type { Unionize } from '@bemedev/types';

import type { PrimitiveObject } from '~types';
import type {
  AFTER_EVENT,
  ALWAYS_EVENT,
  INIT_EVENT,
  MAX_EXCEEDED_EVENT_TYPE,
} from './constants';

export type EventObject<T = any> = {
  type: string;
  payload: T;
};

export type EventsMap = Record<string, PrimitiveObject>;

export type PromiseeDef = {
  then: any;
  catch: any;
};

export type PromiseeMap = Record<string, PromiseeDef>;

export type InitEvent = typeof INIT_EVENT;
export type AlwaysEvent = `${string}::${typeof ALWAYS_EVENT}`;
export type AfterEvent = `${string}::${typeof AFTER_EVENT}`;
export type MaxExceededEvent = typeof MAX_EXCEEDED_EVENT_TYPE;

export type EventStrings =
  | InitEvent
  | AlwaysEvent
  | AfterEvent
  | MaxExceededEvent;

export type AllEvent = EventObject | EventStrings;

export type _EventsR<T extends EventsMap> =
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
  | AfterEvent
  | MaxExceededEvent;

export type EventArg<E extends EventsMap> =
  _EventsR<E> extends infer To
    ? To extends EventObject
      ? object extends To['payload']
        ? To['type'] | To
        : To
      : never
    : never;

export type EventArgT<E extends EventsMap> =
  _EventsR<E> extends infer To extends EventObject ? To['type'] : never;

export type ToEventsMap<
  E extends EventsMap,
  P extends PromiseeMap,
  TT extends ToEventsR<E, P> = ToEventsR<E, P>,
> = {
  [key in keyof TT]: TT[key];
};
