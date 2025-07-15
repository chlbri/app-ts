import type { types } from '@bemedev/types';

/**
 * A callback function type that takes no arguments and returns void.
 *
 * @see {@linkcode Fn} for more details.
 */
type Cb = types.Fn<[], void>;

/**
 * Represents the status of the scheduler.
 *
 * @enum
 * - 'idle': The scheduler is not initialized or processing any tasks.
 * - 'initialized': The scheduler has been initialized and is ready to process tasks.
 * - 'processing': The scheduler is currently processing a task.
 * - 'paused': The scheduler is paused and not processing tasks.
 * - 'working': The scheduler is actively working on a task.
 * - 'stopped': The scheduler has been stopped and will not process any more tasks.
 */
type Status =
  | 'idle'
  | 'initialized'
  | 'processing'
  | 'paused'
  | 'working'
  | 'stopped';

/**
 * A class that manages a queue of tasks and their execution status.
 */
export class Scheduler {
  #queue: Array<Cb> = [];

  #performeds = 0;

  get performeds() {
    return this.#performeds;
  }

  #currentStatus: Status = 'idle';

  /* v8 ignore next 3*/
  get status() {
    return this.#currentStatus;
  }

  initialize = (callback?: Cb) => {
    const check = this.#currentStatus !== 'idle';
    if (check) return;
    this.#currentStatus = 'initialized';

    if (callback) {
      this.#process(callback);
    }

    this.#flush();
  };

  get #processing() {
    return this.#currentStatus === 'processing';
  }

  /**
   * Schedules a callback function for execution.
   * @param task of type {@linkcode Cb} The callback function to be scheduled for execution.
   */
  schedule = (task: Cb) => {
    const check0 = this.#currentStatus === 'stopped';
    if (check0) return;

    const check1 =
      this.#processing ||
      this.#currentStatus === 'idle' ||
      this.#currentStatus === 'paused';

    if (check1) {
      this.#queue.push(task);
      return;
    }

    this.#process(task);
    this.#flush();
  };

  pause = () => {
    this.#currentStatus = 'paused';
  };

  #clear = () => {
    this.#queue = [];
  };

  stop = () => {
    this.pause();
    this.#currentStatus = 'stopped';
    this.#clear();
  };

  #flush = () => {
    let nextCallback = this.#queue.shift();
    while (nextCallback) {
      this.#process(nextCallback);
      nextCallback = this.#queue.shift();
    }
  };

  /**
   * Immediately processes the callback function, updates the status, and increments the performed count.
   *
   * @param callback of type {@linkcode Cb} The callback function to be executed immediately.
   */
  processImmediate = (callback: Cb) => {
    callback();
    this.#performeds++;
    this.#currentStatus = 'working';
  };

  #process = (callback: Cb) => {
    const check =
      this.#currentStatus === 'working' ||
      this.#currentStatus === 'initialized';

    if (check) {
      this.#currentStatus = 'processing';
      this.processImmediate(callback);
    }
  };
}
