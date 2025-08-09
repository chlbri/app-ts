import type { EventsMap, PromiseeMap } from '../events/index.js';
import type { TimerState } from '@bemedev/interval2';
import type { types } from '@bemedev/types';
import type { FnSubReduced, State } from './interpreter.types';
/**
 * Subscriber class that manages the subscription state and provides methods
 * to handle state changes and unsubscribe.
 *
 * @template : {@linkcode EventsMap} [E] - Type of the events map
 * @template : {@linkcode PromiseeMap} [P] - Type of the promisees map
 * @template : {@linkcode types.PrimitiveObject} [Tc] - Type of the context
 * @template : [R] - Type of the return value
 *
 */
declare class SubscriberClass<E extends EventsMap, P extends PromiseeMap = PromiseeMap, Tc extends types.PrimitiveObject = types.PrimitiveObject> {
    #private;
    private _id;
    get id(): string;
    /**
     * Creates an instance of SubscriberMapClass.
     * @param eventsMap - {@linkcode EventsMap} [E] - The events map.
     * @param promiseesMap - {@linkcode PromiseeMap} [P] - The promisees map.
     * @param subscriber - The {@linkcode FnSubReduced} subscriber function or object.
     * @param equals - Function to compare two {@linkcode State}s for equality (optional).
     * @param _id - Unique identifier for the subscriber (optional).
     */
    constructor(eventsMap: E, promiseesMap: P, subscriber: FnSubReduced<E, P, Tc, void>, equals?: (a: State<Tc>, b: State<Tc>) => boolean, _id?: string);
    /**
     * Function to handle state changes.
     * @param previous of type {@linkcode State} - Previous state
     * @param next of type {@linkcode State} - Next state
     *
     * @remarks
     * This function checks if the subscriber can perform its action,
     * compares the previous and next states using the provided equality function,
     * and if they are not equal, it calls the subscriber with the next state.
     * If the states are equal or if the subscriber cannot perform its action,
     */
    fn: (previous: State<Tc>, next: State<Tc>) => any;
    get state(): TimerState;
    close: () => void;
    open: () => void;
    unsubscribe: () => void;
}
export type { SubscriberClass };
export type SubscriberOptions<Tc extends types.PrimitiveObject = types.PrimitiveObject> = {
    id?: string;
    equals?: (a: State<Tc>, b: State<Tc>) => boolean;
};
type CreateSubscriber_F = <E extends EventsMap, P extends PromiseeMap = PromiseeMap, Tc extends types.PrimitiveObject = types.PrimitiveObject>(eventsMap: E, promiseesMap: P, subscriber: FnSubReduced<E, P, Tc, void>, options?: SubscriberOptions<Tc>) => SubscriberClass<E, P, Tc>;
/**
 * Creates a new instance of SubscriberMapClass.
 *
 * @param eventsMap : {@linkcode EventsMap} [E] - The events map.
 * @param promiseesMap : {@linkcode PromiseeMap} [P] - The promisees map.
 * @param subscriber - The subscriber function that will be called with the {@linkcode State}.
 * @param options - Optional parameters for the subscriber, including equality function and ID.
 * @returns A new instance of {@linkcode SubscriberClass} that manages the subscription state and provides methods to handle state changes and unsubscribe.
 *
 * @remarks
 * This function maps the provided events and promisees.
 *
 * This allows for efficient subscription management and state handling depending on the events and promisees.
 */
export declare const createSubscriber: CreateSubscriber_F;
//# sourceMappingURL=subscriber.d.ts.map