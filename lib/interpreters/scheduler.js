/**
 * A class that manages a queue of tasks and their execution status.
 */
class Scheduler {
    #queue = [];
    #performeds = 0;
    get performeds() {
        return this.#performeds;
    }
    #currentStatus = 'idle';
    /* v8 ignore next 3*/
    get status() {
        return this.#currentStatus;
    }
    initialize = (callback) => {
        const check = this.#currentStatus !== 'idle';
        if (check)
            return;
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
    schedule = (task) => {
        const check0 = this.#currentStatus === 'stopped';
        if (check0)
            return;
        const check1 = this.#processing ||
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
    processImmediate = (callback) => {
        callback();
        this.#performeds++;
        this.#currentStatus = 'working';
    };
    #process = (callback) => {
        const check = this.#currentStatus === 'working' ||
            this.#currentStatus === 'initialized';
        if (check) {
            this.#currentStatus = 'processing';
            this.processImmediate(callback);
        }
    };
}

export { Scheduler };
//# sourceMappingURL=scheduler.js.map
