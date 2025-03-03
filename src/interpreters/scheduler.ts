import type { Fn } from '@bemedev/types';

type Cb = Fn<[], void>;

type Status =
  | 'idle'
  | 'initialized'
  | 'processing'
  | 'paused'
  | 'working'
  | 'stopped';

export class Scheduler {
  #queue: Array<Cb> = [];

  #performeds = 0;

  get performeds() {
    return this.#performeds;
  }

  #status: Status = 'idle';

  /* v8 ignore next 3*/
  get status() {
    return this.#status;
  }

  constructor() {}

  initialize = (callback?: Cb) => {
    this.#status = 'initialized';

    if (callback) {
      this.#process(callback);
    }

    this.#flushEvents();
  };

  get processing() {
    return this.#status === 'processing';
  }

  schedule = (task: Cb) => {
    const check0 = this.#status === 'stopped';
    if (check0) return;

    const check1 =
      this.processing ||
      this.#status === 'idle' ||
      this.#status === 'paused';

    if (check1) {
      this.#queue.push(task);
      return;
    }

    this.#process(task);
    this.#flushEvents();
  };

  pause = () => {
    this.#status = 'paused';
  };

  #clear = () => {
    this.#queue = [];
  };

  stop = () => {
    this.pause();
    this.#status = 'stopped';
    this.#clear();
  };

  #flushEvents = () => {
    let nextCallback = this.#queue.shift();
    while (nextCallback) {
      this.#process(nextCallback);
      nextCallback = this.#queue.shift();
    }
  };

  processImmediate = (callback: Cb) => {
    callback();
    this.#performeds++;
    this.#status = 'working';
  };

  #process = (callback: Cb) => {
    const check =
      this.#status === 'working' || this.#status === 'initialized';

    if (check) {
      this.#status = 'processing';
      this.processImmediate(callback);
    }
  };
}
