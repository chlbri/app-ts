'use strict';

var equal = require('fast-deep-equal');
var nanoid = require('nanoid');
require('@bemedev/decompose');
require('../utils/environment.cjs');
require('../utils/merge.cjs');
require('../constants/errors.cjs');
var utils_objects_defineO = require('../utils/objects/defineO.cjs');
require('@bemedev/types');
require('../utils/typings.cjs');

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
  const _options = utils_objects_defineO.defineO(options, {
    id: nanoid.nanoid(),
    equals: equal,
  });
  console.log(Object.keys(_options));
  return new SubscriberClass2(subscriber, _options.equals, _options.id);
};

exports.createSubscriber2 = createSubscriber2;
//# sourceMappingURL=subscriber2.cjs.map
