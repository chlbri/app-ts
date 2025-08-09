import type { types } from '@bemedev/types';
import type { INIT_EVENT, MAX_EXCEEDED_EVENT_TYPE } from './constants';
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
 * @see {@linkcode types.PrimitiveObject} for the type of the payload.
 */
export type EventsMap = Record<string, types.PrimitiveObject>;
export type PromiseeDef = {
    then: types.SoRa<types.PrimitiveObject>;
    catch: types.SoRa<types.PrimitiveObject>;
};
export type PromiseeMap = Record<string, PromiseeDef>;
export type InitEvent = typeof INIT_EVENT;
export type MaxExceededEvent = typeof MAX_EXCEEDED_EVENT_TYPE;
/**
 * Represents a union of all event strings.
 */
export type EventStrings = InitEvent | MaxExceededEvent;
export type AllEvent = EventObject | EventStrings;
/**
 * Transforms a map of events into a union type of event objects.
 * Each event object has a type and payload.
 * @template : {@linkcode EventsMap} [T], the map to transform.
 *
 * @see {@linkcode Unionize} for the utility type that creates a union type from
 * the keys of the map.
 */
export type _EventsR<T extends EventsMap> = types.Unionize<T> extends infer U ? U extends any ? {
    type: keyof U & string;
    payload: U[keyof U];
} : never : never;
/**
 * Transforms a map of promisees into a union type of event objects.
 * Each event object has a type and payload.
 * @template : {@linkcode PromiseeMap} [T], the map to transform.
 *
 * @see {@linkcode Unionize} for the utility type that creates a union type from
 * the keys of the map.
 */
type _PromiseesR<T extends PromiseeMap> = types.Unionize<T> extends infer U extends PromiseeMap ? U extends any ? {
    type: `${keyof U & string}::then`;
    payload: U[keyof U]['then'];
} | {
    type: `${keyof U & string}::catch`;
    payload: U[keyof U]['catch'];
} : never : never;
/**
 * Represents a union type of all events and promisees.
 * It combines the transformed events and promisees into a single type.
 * @template : {@linkcode EventsMap} [E], the map of events.
 * @template : {@linkcode PromiseeMap} [P], the map of promisees.
 * @returns A union type of events and promisee-events.
 */
export type ToEventsR<E extends EventsMap, P extends PromiseeMap> = _EventsR<E> | _PromiseesR<P>;
export type ToEvents<E extends EventsMap, P extends PromiseeMap> = ToEventsR<E, P> | InitEvent | MaxExceededEvent;
/**
 * Transforms an event map into arguments to send to the machine.
 * @template : {@linkcode EventsMap} [E], the map of events.
 *
 * @see {@linkcode _EventsR} for the utility type that transforms the map into a union type.
 * @see {@linkcode EventObject} for the structure of the event object.
 */
export type EventArg<E extends EventsMap> = _EventsR<E> extends infer To ? To extends EventObject ? object extends To['payload'] ? To['type'] | To : To : never : never;
/**
 * Extracts the type of the event from the event map.
 * @template : {@linkcode EventsMap} [E], the map of events
 *
 * @see {@linkcode _EventsR} for the utility type that transforms the map into a union type.
 * @see {@linkcode EventObject} for the structure of the event object.
 */
export type EventArgT<E extends EventsMap> = _EventsR<E> extends infer To extends EventObject ? To['type'] : never;
export {};
//# sourceMappingURL=types.d.ts.map