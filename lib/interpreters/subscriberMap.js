import { castings } from '@bemedev/types';
import equal from 'fast-deep-equal';
import { nanoid } from 'nanoid';
import '@bemedev/decompose';
import '../utils/environment.js';
import '../utils/merge.js';
import { nothing } from '../utils/nothing.js';
import { toEventsMap } from '../utils/reduceFnMap.js';
import '../constants/errors.js';
import { isFunction } from '../types/primitives.js';

/**
 * Subscriber class that manages the subscription state and provides methods
 * to handle state changes and unsubscribe.
 *
 * @template : {@linkcode EventsMap} [E] - Type of the events map
 * @template : {@linkcode PromiseeMap} [P] - Type of the promisees map
 * @template : {@linkcode PrimitiveObject} [Tc] - Type of the context
 * @template : [R] - Type of the return value
 */
class SubscriberMapClass {
  _id;
  #subscriber;
  #eventsMap;
  #promiseesMap;
  #state = 'idle';
  /**
   * Function to compare two {@linkcode State}s for equality.
   * @param previous of type {@linkcode State} - First state to compare
   * @param next of type {@linkcode State} - Second state to compare
   */
  #equals;
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
    eventsMap,
    promiseesMap,
    subscriber,
    equals = equal,
    _id = nanoid(),
  ) {
    this._id = _id;
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
    return state => {
      const event = state.event;
      const check5 = typeof event === 'string';
      const _else = sub.else ?? nothing;
      if (check5) return castings.commons.any(_else(state));
      const { type } = event;
      for (const key of keys) {
        const check2 = type === key;
        const func = castings.commons.any(sub)[key];
        const check3 = !!func;
        const check4 = check2 && check3;
        if (check4) return func(state);
      }
      return castings.commons.any(_else(state));
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
  fn = (previous, next) => {
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
/**
 * Creates a new instance of SubscriberMapClass.
 *
 * @param eventsMap : {@linkcode EventsMap} [E] - The events map.
 * @param promiseesMap : {@linkcode PromiseeMap} [P] - The promisees map.
 * @param subscriber - The subscriber function that will be called with the {@linkcode State}.
 * @param options - Optional parameters for the subscriber, including equality function and ID.
 * @returns A new instance of {@linkcode SubscriberMapClass} that manages the subscription state and provides methods to handle state changes and unsubscribe.
 *
 * @remarks
 * This function maps the provided events and promisees.
 *
 * This allows for efficient subscription management and state handling depending on the events and promisees.
 */
const createSubscriberMap = (
  eventsMap,
  promiseesMap,
  subscriber,
  options,
) => {
  return new SubscriberMapClass(
    eventsMap,
    promiseesMap,
    subscriber,
    options?.equals,
    options?.id,
  );
};

export { createSubscriberMap };
//# sourceMappingURL=subscriberMap.js.map
