import _any from '#bemedev/features/common/castings/any';
import type { PrimitiveObject } from '#bemedev/globals/types';
import type { ActorsConfigMap, EventsMap, ToEvents2 } from '#events';
import type { State } from '#states';
import { nothing, toEventsMap } from '#utils';
import type { TimerState } from '@bemedev/interval2';
import equal from 'fast-deep-equal';
import { nanoid } from 'nanoid';
import { isFunction } from '../types/primitives';
import type { FnSubReduced } from './interpreter.types';
import type { Config } from 'src/machine/types';

/**
 * Subscriber class that manages the subscription state and provides methods
 * to handle state changes and unsubscribe.
 *
 * @template : {@linkcode EventsMap} [E] - Type of the events map
 * @template : {@linkcode ActorsConfigMap} [A] - Type of the actors map
 * @template : {@linkcode PrimitiveObject} [Tc] - Type of the context
 * @template : [R] - Type of the return value
 *
 */
class SubscriberClass<
  C extends Config,
  E extends EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Tc extends PrimitiveObject = PrimitiveObject,
> {
  #subscriber: FnSubReduced<C, E, A, Tc, void>;

  #eventsMap: E;

  #actorsMap: A;

  #state: TimerState = 'idle';

  /**
   * Function to compare two {@linkcode State}s for equality.
   * @param previous of type {@linkcode State} - First state to compare
   * @param next of type {@linkcode State} - Second state to compare
   */
  #equals: (
    previous: State<C, Tc, ToEvents2<E, A>, A>,
    next: State<C, Tc, ToEvents2<E, A>, A>,
  ) => boolean;

  get id() {
    return this._id;
  }

  get equals() {
    return this.#equals;
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
    actorsMap: A,
    subscriber: FnSubReduced<C, E, A, Tc, void>,
    equals: (
      a: State<C, Tc, ToEvents2<E, A>, A>,
      b: State<C, Tc, ToEvents2<E, A>, A>,
    ) => boolean = equal,
    private _id = nanoid(),
  ) {
    this.#subscriber = subscriber;
    this.#eventsMap = eventsMap;
    this.#actorsMap = actorsMap;
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
    if (check1) return _any(sub);

    const map = toEventsMap(this.#eventsMap, this.#actorsMap);
    const keys = Object.keys(map);

    return ({ event, ...rest }: State<C, Tc, ToEvents2<E, A>, A>) => {
      const check5 = typeof event === 'string';
      const _else = sub.else ?? nothing;
      if (check5) return _any(_else({ event, ...rest }));

      const { type, payload } = event;

      for (const key of keys) {
        const check2 = type === key;
        const func = _any(sub)[key];
        const check3 = !!func;

        const check4 = check2 && check3;
        if (check4) return func({ payload, ...rest });
      }

      return _any(_else({ event, ...rest }));
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
  fn = (
    previous: State<C, Tc, ToEvents2<E, A>, A>,
    next: State<C, Tc, ToEvents2<E, A>, A>,
  ) => {
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
  C extends Config = Config,
  Tc extends PrimitiveObject = PrimitiveObject,
> = {
  id?: string;
  equals?: (a: State<C, Tc>, b: State<C, Tc>) => boolean;
};

type CreateSubscriber_F = <
  C extends Config,
  E extends EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Tc extends PrimitiveObject = PrimitiveObject,
>(
  eventsMap: E,
  actorsMap: A,
  subscriber: FnSubReduced<C, E, A, Tc, void>,
  options?: SubscriberOptions<C, Tc>,
) => SubscriberClass<C, E, A, Tc>;

/**
 * Creates a new instance of SubscriberMapClass.
 *
 * @param eventsMap : {@linkcode EventsMap} [E] - The events map.
 * @param actorsMap : {@linkcode ActorsConfigMap} [A] - The actors map.
 * @param subscriber - The subscriber function that will be called with the {@linkcode State}.
 * @param options - Optional parameters for the subscriber, including equality function and ID.
 * @returns A new instance of {@linkcode SubscriberClass} that manages the subscription state and provides methods to handle state changes and unsubscribe.
 *
 * @remarks
 * This function maps the provided events and actors.
 *
 * This allows for efficient subscription management and state handling depending on the events and actors.
 */
export const createSubscriber: CreateSubscriber_F = (
  eventsMap,
  actorsMap,
  subscriber,
  options,
) => {
  return new SubscriberClass(
    eventsMap,
    actorsMap,
    subscriber,
    options?.equals,
    options?.id,
  );
};
