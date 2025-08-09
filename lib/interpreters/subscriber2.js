import equal from 'fast-deep-equal';
import { nanoid } from 'nanoid';
import '@bemedev/decompose';
import '../utils/environment.js';
import '../utils/merge.js';
import '../constants/errors.js';
import { defineO } from '../utils/objects/defineO.js';
import '@bemedev/types';
import '../utils/typings.js';

class SubscriberClass2 {
  _id;
  #subscriber;
  #equals;
  #state = 'idle';
  get id() {
    return this._id;
  }
  constructor(subscriber, equals, _id) {
    this._id = _id;
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
  fn(previous, next) {
    if (this.cannotPerform) return;
    const _equals = this.#equals(previous, next);
    if (_equals) return;
    this.#subscriber(next);
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
const createSubscriber2 = (subscriber, options) => {
  const _options = defineO(options, {
    id: nanoid(),
    equals: equal,
  });
  console.log(Object.keys(_options));
  return new SubscriberClass2(subscriber, _options.equals, _options.id);
};

export { createSubscriber2 };
//# sourceMappingURL=subscriber2.js.map
