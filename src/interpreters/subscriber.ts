import type { TimerState } from '@bemedev/interval2';
import equal from 'fast-deep-equal';
import { nanoid } from 'nanoid';
import { PrimitiveObject } from '~types';
import type { State } from './interpreter.types';

/**
 * Subscriber class that manages the subscription state and provides methods
 * to handle state changes and unsubscribe.
 *
 * @template : {@linkcode PrimitiveObject} [Tc] - Type of the context
 */
class SubscriberClass<Tc extends PrimitiveObject = PrimitiveObject> {
  #subscriber: (state: State<Tc>) => void;

  /**
   * Function to compare two {@linkcode State}s for equality.
   * @param previous of type {@linkcode State} - First state to compare
   * @param next of type {@linkcode State} - Second state to compare
   */
  #equals: (previous: State<Tc>, next: State<Tc>) => boolean;

  #state: TimerState = 'idle';

  get id() {
    return this._id;
  }

  constructor(
    subscriber: (state: State<Tc>) => void,
    equals: (a: State<Tc>, b: State<Tc>) => boolean = equal,
    private _id: string = nanoid(),
  ) {
    this.#subscriber = subscriber;
    this.#equals = equals;

    this.#state = 'active';
  }

  /* v8 ignore next 3*/
  get state() {
    return this.#state;
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

    this.#subscriber(next);
  };

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
  Tc extends PrimitiveObject = PrimitiveObject,
> = {
  id?: string;
  equals?: (a: State<Tc>, b: State<Tc>) => boolean;
};

/**
 * Creates a new subscriber instance.
 *
 * @param subscriber The subscriber function that will be called with the {@linkcode State}.
 * @param options Optional parameters for the subscriber, including:
 * - `equals`: A function to compare two {@linkcode State}s for equality.
 * - `id`: An optional identifier for the subscriber.
 *
 * @returns An instance of {@linkcode SubscriberClass} that manages the subscription state and provides methods to handle state changes and unsubscribe.
 */
export const createSubscriber = <
  Tc extends PrimitiveObject = PrimitiveObject,
>(
  subscriber: (state: State<Tc>) => void,
  options?: SubscriberOptions<Tc>,
) => {
  return new SubscriberClass(subscriber, options?.equals, options?.id);
};
