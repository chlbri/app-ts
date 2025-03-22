import type { TimerState } from '@bemedev/interval2';
import { nanoid } from 'nanoid';
import type { EventsMap, PromiseeMap, ToEvents } from '~events';
import { PrimitiveObject } from '~types';
import { nothing, reduceFnMap2 } from '~utils';
import { type FnMapReduced } from '../types/primitives';

export type SubscriberMap<
  E extends EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Tc extends PrimitiveObject = PrimitiveObject,
  R = any,
> = {
  func: FnMapReduced<E, P, Tc, R>;
  id: string;
  // status: string;
  // close: () => void;
};

class SubscriberClass<
  E extends EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Tc extends PrimitiveObject = PrimitiveObject,
  R = any,
> {
  #subscriber: FnMapReduced<E, P, Tc, R>;

  #eventsMap: E;
  #promiseesMap: P;

  #state: TimerState = 'idle';

  get id() {
    return this._id;
  }

  constructor(
    eventsMap: E,
    promiseesMap: P,
    subscriber: FnMapReduced<E, P, Tc, R>,
    private _id: string,
  ) {
    this.#subscriber = subscriber;
    this.#eventsMap = eventsMap;
    this.#promiseesMap = promiseesMap;

    this.#state = 'active';
  }

  get reduced(): (context: Tc, events: ToEvents<E, P>) => R {
    if (this.#state === 'paused') return nothing as any;

    const func = (context: Tc, events: ToEvents<E, P>) => {
      return reduceFnMap2(
        this.#eventsMap,
        this.#promiseesMap,
        this.#subscriber,
      )(context, events);
    };

    return func;
  }

  /* v8 ignore next 3*/
  get state() {
    return this.#state;
  }

  close() {
    if (this.state !== 'disposed') this.#state = 'paused';
  }

  open() {
    if (this.state !== 'disposed') this.#state = 'active';
  }

  unsubscribe() {
    this.close();
    this.#state = 'disposed';
  }
}

export type { SubscriberClass };

export type CreateSubscriber_F = <
  E extends EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Tc extends PrimitiveObject = PrimitiveObject,
  R = any,
>(
  eventsMap: E,
  promiseesMap: P,
  subscriber: FnMapReduced<E, P, Tc, R>,
  id?: string,
) => SubscriberClass<E, P, Tc, R>;

export const createSubscriber: CreateSubscriber_F = (
  eventsMap,
  promiseesMap,
  subscriber,
  id,
) => {
  return new SubscriberClass(
    eventsMap,
    promiseesMap,
    subscriber,
    id ?? nanoid(),
  );
};
