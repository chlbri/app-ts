import type {
  Equals,
  NotUndefined,
  PrimitiveObject,
  Unionize,
} from '#bemedev/globals/types';
import type { EmitterConfigMap } from '#emitters';
import type { ChildConfigMap } from '#machines';
import type {
  ALWAYS_EVENT,
  INIT_EVENT,
  MAX_EXCEEDED_EVENT_TYPE,
} from './constants';
import { EmptyObject } from '@bemedev/decompose';

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
 *
 * @see {@linkcode PrimitiveObject} for the type of the payload.
 */
export type EventsMap = Record<string, PrimitiveObject>;

export type InitEvent = typeof INIT_EVENT;
export type MaxExceededEvent = typeof MAX_EXCEEDED_EVENT_TYPE;
export type AlwaysEvent = typeof ALWAYS_EVENT;

/**
 * Represents a union of all event strings.
 */
export type EventStrings = InitEvent | MaxExceededEvent | AlwaysEvent;

export type AllEvent = EventObject | EventStrings;

/**
 * Transforms a map of events into a union type of event objects.
 * Each event object has a type and payload.
 * @template : {@linkcode EventsMap} [T], the map to transform.
 *
 * @see {@linkcode Unionize} for the utility type that creates a union type from
 * the keys of the map.
 */
export type EventsR<T extends EventsMap> =
  Unionize<T> extends infer U
    ? U extends any
      ? { type: keyof U & string; payload: U[keyof U] }
      : never
    : never;

type _EmitterConfigR<T extends EmitterConfigMap> =
  Unionize<T> extends infer U extends EmitterConfigMap
    ? U extends any
      ?
          | {
              type: `${keyof U & string}::next`;
              payload: U[keyof U]['next'];
            }
          | {
              type: `${keyof U & string}::error`;
              payload: U[keyof U]['error'];
            }
      : never
    : never;

type _ChildConfigR<T extends ChildConfigMap> = {
  [key in keyof T & string]: Unionize<T[key]> extends infer U
    ? U extends any
      ? { type: `${key}::on::${keyof U & string}`; payload: U[keyof U] }
      : never
    : never;
}[keyof T & string];

export type ActorsConfigMap = {
  children?: ChildConfigMap;
  emitters?: EmitterConfigMap;
};

/**
 * Represents a union type of all events, emitters, and child events.
 * It combines the transformed events, emitters, and child events into a single type.
 * @template : {@linkcode EventsMap} [E], the map of events.
 * @template : {@linkcode ActorsConfigMap} [A], the configuration map for actors which includes children and emitters.
 * @returns A union type of events, emitter-events, and child-events.
 */
export type ToEventsR<E extends EventsMap, A extends ActorsConfigMap> =
  | EventsR<E>
  | _EmitterConfigR<NotUndefined<A['emitters']>>
  | _ChildConfigR<NotUndefined<A['children']>>;

export type ToEvents<E extends EventsMap, A extends ActorsConfigMap> =
  | ToEventsR<E, A>
  | EventStrings;

export type EventArgObject<E extends EventObject> =
  object extends E['payload']
    ? E['type'] | E
    : Equals<E['payload'], EmptyObject> extends true
      ? E['type'] | E
      : E;

export type EventArgAll<E extends AllEvent> = E extends string
  ? E
  : E extends EventObject
    ? EventArgObject<E>
    : never;

/**
 * Transforms an event map into arguments to send to the machine.
 * @template : {@linkcode EventsMap} [E], the map of events.
 *
 * @see {@linkcode EventsR} for the utility type that transforms the map into a union type.
 * @see {@linkcode EventObject} for the structure of the event object.
 */
export type EventArg<E extends EventsMap> = EventArgObject<EventsR<E>>;

/**
 * Extracts the type of the event from the event map.
 * @template : {@linkcode EventsMap} [E], the map of events
 *
 * @see {@linkcode EventsR} for the utility type that transforms the map into a union type.
 * @see {@linkcode EventObject} for the structure of the event object.
 */
export type EventArgT<E extends EventsMap> =
  EventsR<E> extends infer To extends EventObject ? To['type'] : never;

export type ToEventObject<
  T extends AllEvent,
  Ex extends string = never,
> = Exclude<
  T extends string ? { type: T; payload: EmptyObject } : T,
  { type: Ex }
>;

export type EventToType<
  T extends AllEvent,
  Ex extends string = never,
> = Exclude<
  T extends {
    type: infer U extends string;
  }
    ? U
    : T,
  Ex
>;
