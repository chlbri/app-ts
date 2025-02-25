import type { Unionize } from '@bemedev/types';
import type {
  CatchEvent,
  MaxExceededEvent,
  ThenEvent,
} from 'src/constants/events';

import type { PrimitiveObject } from '~types';
import type { ALWAYS_EVENT, INIT_EVENT } from './constants';

export type EventObject<T = any> = {
  type: string;
  payload?: T;
};

export type EventsMap = Record<string, PrimitiveObject>;

export type InitEvent = typeof INIT_EVENT;
export type AlwaysEvent = typeof ALWAYS_EVENT;

export type ToEventsR<T extends EventsMap> =
  | (Unionize<T> extends infer U
      ? U extends any
        ? { type: keyof U; payload: U[keyof U] }
        : never
      : never)
  | ThenEvent
  | CatchEvent;

export type ToEvents<T extends EventsMap> =
  | ToEventsR<T>
  | InitEvent
  | AlwaysEvent
  | MaxExceededEvent;

export type EventArg<T extends EventsMap> =
  ToEventsR<T> extends infer To
    ? To extends EventObject
      ? object extends To['payload']
        ? To['type'] | To
        : To
      : never
    : never;
