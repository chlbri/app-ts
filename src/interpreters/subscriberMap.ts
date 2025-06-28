import type { TimerState } from '@bemedev/interval2';
import { t } from '@bemedev/types';
import equal from 'fast-deep-equal';
import { nanoid } from 'nanoid';
import type { EventsMap, PromiseeMap } from '~events';
import { PrimitiveObject } from '~types';
import { nothing, toEventsMap } from '~utils';
import { isFunction } from '../types/primitives';
import type { FnSubReduced, State } from './interpreter.types';
import type { SubscriberOptions } from './subscriber';

class SubscriberMapClass<
  E extends EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Tc extends PrimitiveObject = PrimitiveObject,
  R = any,
> {
  #subscriber: FnSubReduced<E, P, Tc, R>;

  #eventsMap: E;
  #promiseesMap: P;

  #state: TimerState = 'idle';
  #equals: (a: State<Tc>, b: State<Tc>) => boolean;

  get id() {
    return this._id;
  }

  constructor(
    eventsMap: E,
    promiseesMap: P,
    subscriber: FnSubReduced<E, P, Tc, R>,
    equals: (a: State<Tc>, b: State<Tc>) => boolean = equal,
    private _id = nanoid(),
  ) {
    this.#subscriber = subscriber;
    this.#eventsMap = eventsMap;
    this.#promiseesMap = promiseesMap;
    this.#equals = equals;

    this.#state = 'active';
  }

  #reduceFn = () => {
    const sub = this.#subscriber;
    const check1 = isFunction(sub);
    if (check1) return t.any(sub);

    const map = toEventsMap(this.#eventsMap, this.#promiseesMap);
    const keys = Object.keys(map);

    return (state: State<Tc>) => {
      const event = state.event;
      const check5 = typeof event === 'string';
      const _else = sub.else ?? nothing;
      if (check5) return t.any(_else(state));

      const { type } = event;

      for (const key of keys) {
        const check2 = type === key;
        const func = t.any(sub)[key];
        const check3 = !!func;

        const check4 = check2 && check3;
        if (check4) return func(state);
      }

      return t.any(_else(state));
    };
  };

  get cannotPerform() {
    return !(this.#state === 'active');
  }

  reduced = (previous: State<Tc>, next: State<Tc>) => {
    if (this.cannotPerform) return;

    const _equals = this.#equals(previous, next);
    if (_equals) return;

    return this.#reduceFn()(next);
  };

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

export type { SubscriberMapClass };

type CreateSubscriber_F = <
  E extends EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Tc extends PrimitiveObject = PrimitiveObject,
  R = any,
>(
  eventsMap: E,
  promiseesMap: P,
  subscriber: FnSubReduced<E, P, Tc, R>,
  options?: SubscriberOptions<Tc>,
) => SubscriberMapClass<E, P, Tc, R>;

export const createSubscriberMap: CreateSubscriber_F = (
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
