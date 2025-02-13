import type { Fn } from '@bemedev/types';

interface SchedulerOptions {
  deferEvents: boolean;
}

const defaultOptions: SchedulerOptions = {
  deferEvents: false,
};

type Cb = Fn<[], void>;

type Status = 'idle' | 'initialized' | 'processing' | 'paused' | 'working';

export class Scheduler {
  #queue: Array<Cb> = [];

  #performeds = 0;

  get performeds() {
    return this.#performeds;
  }

  #status: Status = 'idle';

  get status() {
    return this.#status;
  }

  get #isEmpty() {
    return this.#queue.length === 0;
  }

  // deferred feature
  private options: SchedulerOptions;

  constructor(options?: Partial<SchedulerOptions>) {
    this.options = { ...defaultOptions, ...options };
  }

  initialize = (callback?: Cb) => {
    this.#status = 'initialized';

    if (callback) {
      if (!this.options.deferEvents) {
        this.schedule(callback);
        return;
      }

      this.#process(callback);
    }

    this.#flushEvents();
  };

  get processing() {
    return this.#status === 'processing';
  }

  schedule = (task: Cb) => {
    const check1 =
      this.processing ||
      this.#status === 'idle' ||
      this.#status === 'paused';

    if (check1) {
      this.#queue.push(task);
      return;
    }

    if (!this.#isEmpty) {
      throw new Error(
        'Event queue should be empty when it is not processing events',
      );
    }

    this.#process(task);
    this.#flushEvents();
  };

  pause = () => {
    this.#status = 'paused';
  };

  clear = () => {
    this.#queue = [];
  };

  #flushEvents = () => {
    let nextCallback = this.#queue.shift();
    while (nextCallback) {
      this.#process(nextCallback);
      nextCallback = this.#queue.shift();
    }
  };

  #process = (callback: Cb) => {
    const check =
      this.#status === 'working' || this.#status === 'initialized';

    if (check) {
      this.#status = 'processing';
      try {
        callback();
        this.#performeds++;
      } catch (e) {
        // there is no use to keep the future events
        // as the situation is not anymore the same
        this.clear();
        throw e;
      } finally {
        this.#status = 'working';
      }
    }
  };
}
