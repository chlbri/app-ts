import type { TimerState } from '@bemedev/interval2';
import type { EventsMap, ToEvents } from '~events';
import { PrimitiveObject } from '~types';
import { nothing, reduceFnMap2 } from '~utils';
import { type FnMapReduced } from '../types/primitives';

export type SubscriberMap<
  E extends EventsMap,
  Tc extends PrimitiveObject = PrimitiveObject,
  R = any,
> = {
  func: FnMapReduced<E, Tc, R>;
  id: string;
  // status: string;
  // close: () => void;
};

class Subscriber<
  E extends EventsMap,
  Tc extends PrimitiveObject = PrimitiveObject,
  R = any,
> {
  #subscriber: FnMapReduced<E, Tc, R>;

  #eventsMap: E;

  #state: TimerState = 'idle';

  constructor(eventsMap: E, subscriber: FnMapReduced<E, Tc, R>) {
    this.#subscriber = subscriber;
    this.#eventsMap = eventsMap;

    this.#state = 'active';
  }

  get reduced(): (context: Tc, events: ToEvents<E>) => R {
    if (this.#state === 'paused') return nothing as any;

    const func = (context: Tc, events: ToEvents<E>) => {
      return reduceFnMap2(this.#eventsMap, this.#subscriber)(
        context,
        events,
      );
    };

    return func;
  }

  /* v8 ignore next 3*/
  get state() {
    return this.#state;
  }

  close() {
    this.#state = 'paused';
  }

  open() {
    this.#state = 'active';
  }
}

export type { Subscriber };

export type CreateSubscriber_F = <
  E extends EventsMap,
  Tc extends PrimitiveObject = PrimitiveObject,
  R = any,
>(
  eventsMap: E,
  subscriber: FnMapReduced<E, Tc, R>,
) => Subscriber<E, Tc, R>;

export const createSubscriber: CreateSubscriber_F = (
  eventsMap,
  subscriber,
) => {
  return new Subscriber(eventsMap, subscriber);
};
