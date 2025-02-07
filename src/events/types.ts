import type { Unionize } from '@bemedev/types';
import type {
  CatchEvent,
  MaxExceededEvent,
  ThenEvent,
} from 'src/machine/constants';
import type {
  AlwaysEvent,
  InitEvent,
} from 'src/machine/interpreter.types';

export type EventObject<T = any> = {
  type: string;
  payload?: T;
};

export type EventsMap = Record<string, any>;

export type ToEvents<T extends EventsMap> =
  | (Unionize<T> extends infer U
      ? U extends any
        ? { type: keyof U; payload: U[keyof U] }
        : never
      : never)
  | InitEvent
  | AlwaysEvent
  | ThenEvent
  | CatchEvent
  | MaxExceededEvent;

export type EventArg<T extends EventsMap> =
  ToEvents<T> extends infer To extends ToEvents<EventsMap>
    ? To extends string
      ? To
      : To extends EventObject
        ? object extends To['payload']
          ? To['type']|To
          : To
        : never
    : never;
