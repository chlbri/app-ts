import type { TimerState } from '@bemedev/interval2';
import equal from 'fast-deep-equal';
import { nanoid } from 'nanoid';
import { PrimitiveObject } from '~types';
import type { State } from './interpreter.types';

class SubscriberClass<Tc extends PrimitiveObject = PrimitiveObject> {
  #subscriber: (state: State<Tc>) => void;
  #equals: (a: State<Tc>, b: State<Tc>) => boolean;

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

  get cannotPerform() {
    return !(this.#state === 'active');
  }

  fn = (previous: State<Tc>, next: State<Tc>) => {
    if (this.cannotPerform) return;

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

export const createSubscriber = <
  Tc extends PrimitiveObject = PrimitiveObject,
>(
  subscriber: (state: State<Tc>) => void,
  options?: SubscriberOptions<Tc>,
) => {
  return new SubscriberClass(subscriber, options?.equals, options?.id);
};
