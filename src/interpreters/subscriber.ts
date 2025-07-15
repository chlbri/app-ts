import type { TimerState } from '@bemedev/interval2';
import type { types } from '@bemedev/types';
import { castings } from '@bemedev/types';
import equal from 'fast-deep-equal';
import { nanoid } from 'nanoid';
import type { EventsMap, PromiseeMap, ToEvents } from '~events';
import { nothing, toEventsMap } from '~utils';
import { isFunction } from '../types/primitives';
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
class SubscriberClass<
  E extends EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
> {
  #subscriber: FnSubReduced<E, P, Tc, void>;

  #eventsMap: E;

  #promiseesMap: P;

  #state: TimerState = 'idle';

  /**
   * Function to compare two {@linkcode State}s for equality.
   * @param previous of type {@linkcode State} - First state to compare
   * @param next of type {@linkcode State} - Second state to compare
   */
  #equals: (previous: State<Tc>, next: State<Tc>) => boolean;

  get id() {
    return this._id;
  }

  /**
   * Creates an instance of SubscriberMapClass.
   * @param eventsMap - {@linkcode EventsMap} [E] - The events map.
   * @param promiseesMap - {@linkcode PromiseeMap} [P] - The promisees map.
   * @param subscriber - The {@linkcode FnSubReduced} subscriber function or object.
   * @param equals - Function to compare two {@linkcode State}s for equality (optional).
   * @param _id - Unique identifier for the subscriber (optional).
   */
  constructor(
    eventsMap: E,
    promiseesMap: P,
    subscriber: FnSubReduced<E, P, Tc, void>,
    equals: (a: State<Tc>, b: State<Tc>) => boolean = equal,
    private _id = nanoid(),
  ) {
    this.#subscriber = subscriber;
    this.#eventsMap = eventsMap;
    this.#promiseesMap = promiseesMap;
    this.#equals = equals;

    this.#state = 'active';
  }

  /**
   * Function that returns a reduced function based on the subscriber's logic.
   * @returns A function that reduces the state based on the subscriber's logic.
   *
   * @see {@linkcode isFunction} to check if the subscriber is a function.
   * @see {@linkcode toEventsMap} to convert the events and promisees maps
   * to a unified map.
   * @see {@linkcode nothing} to provide a default action if no event matches.
   * @see {@linkcode t} to ensure type safety in the returned function.
   */
  get #reduceFn() {
    const sub = this.#subscriber;
    const check1 = isFunction(sub);
    if (check1) return castings.commons.any(sub);

    const map = toEventsMap(this.#eventsMap, this.#promiseesMap);
    const keys = Object.keys(map);

    return ({ event, ...rest }: State<Tc, ToEvents<E, P>>) => {
      const check5 = typeof event === 'string';
      const _else = sub.else ?? nothing;
      if (check5) return castings.commons.any(_else({ event, ...rest }));

      const { type, payload } = event;

      for (const key of keys) {
        const check2 = type === key;
        const func = castings.commons.any(sub)[key];
        const check3 = !!func;

        const check4 = check2 && check3;
        if (check4) return func({ payload, ...rest });
      }

      return castings.commons.any(_else({ event, ...rest }));
    };
  }

  get #cannotPerform() {
    return !(this.#state === 'active');
  }

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
  fn = (previous: State<Tc>, next: State<Tc>) => {
    if (this.#cannotPerform) return;

    const _equals = this.#equals(previous, next);
    if (_equals) return;

    return this.#reduceFn(next);
  };

  /* v8 ignore next 3*/
  get state() {
    return this.#state;
  }

  close = () => {
    if (this.state !== 'disposed') this.#state = 'paused';
  };

  open = () => {
    if (this.state !== 'disposed') this.#state = 'active';
  };

  unsubscribe = () => {
    this.close();
    this.#state = 'disposed';
  };
}

export type { SubscriberClass };

export type SubscriberOptions<
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
> = {
  id?: string;
  equals?: (a: State<Tc>, b: State<Tc>) => boolean;
};

type CreateSubscriber_F = <
  E extends EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
>(
  eventsMap: E,
  promiseesMap: P,
  subscriber: FnSubReduced<E, P, Tc, void>,
  options?: SubscriberOptions<Tc>,
) => SubscriberClass<E, P, Tc>;

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
export const createSubscriber: CreateSubscriber_F = (
  eventsMap,
  promiseesMap,
  subscriber,
  options,
) => {
  return new SubscriberClass(
    eventsMap,
    promiseesMap,
    subscriber,
    options?.equals,
    options?.id,
  );
};
