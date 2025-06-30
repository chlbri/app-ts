import type { Unionize } from '@bemedev/types';

import type { PrimitiveObject } from '~types';
import type {
  AFTER_EVENT,
  ALWAYS_EVENT,
  INIT_EVENT,
  MAX_EXCEEDED_EVENT_TYPE,
} from './constants';

/**
 * Represents an event object with a type and payload.
 * @template T - The type of the payload.
 * @returns An object with a type and payload.
 */
export type EventObject<T = any> = {
  type: string;
  payload: T;
};

/**
 * Represents a map of events where the keys are event names and the values are the payloads.
 */
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

/**
 * Represents a union of all event strings.
 */
export type EventStrings =
  | InitEvent
  | AlwaysEvent
  | AfterEvent
  | MaxExceededEvent;

export type AllEvent = EventObject | EventStrings;

/**
 * Transforms a map of events into a union type of event objects.
 * Each event object has a type and payload.
 * @template : {@linkcode EventsMap} [T], the map to transform.
 */
export type _EventsR<T extends EventsMap> =
  Unionize<T> extends infer U
    ? U extends any
      ? { type: keyof U & string; payload: U[keyof U] }
      : never
    : never;

/**
 * Transforms a map of promisees into a union type of event objects.
 * Each event object has a type and payload.
 * @template : {@linkcode PromiseeMap} [T], the map to transform.
 */
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

/**
 * Represents a union type of all events and promisees.
 * It combines the transformed events and promisees into a single type.
 * @template : {@linkcode EventsMap} [E] - The map of events.
 * @template : {@linkcode PromiseeMap} [P] - The map of promisees.
 * @returns A union type of event objects and promisee objects.
 */
export type ToEventsR<E extends EventsMap, P extends PromiseeMap> =
  | _EventsR<E>
  | _PromiseesR<P>;

export type ToEvents<E extends EventsMap, P extends PromiseeMap> =
  | ToEventsR<E, P>
  | InitEvent
  | AlwaysEvent
  | AfterEvent
  | MaxExceededEvent;

/**
 * Transforms an event map into arguments to send to the machine.
 * @template : {@linkcode EventsMap} [E] - The map of events.
 */
export type EventArg<E extends EventsMap> =
  _EventsR<E> extends infer To
    ? To extends EventObject
      ? object extends To['payload']
        ? To['type'] | To
        : To
      : never
    : never;

/**
 * Extracts the type of the event from the event map.
 * @template : {@linkcode EventsMap} [E] - The map of events
 */
export type EventArgT<E extends EventsMap> =
  _EventsR<E> extends infer To extends EventObject ? To['type'] : never;
