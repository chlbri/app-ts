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
type Status = 'idle' | 'initialized' | 'processing' | 'paused' | 'working' | 'stopped';
/**
 * A class that manages a queue of tasks and their execution status.
 */
export declare class Scheduler {
    #private;
    get performeds(): number;
    get status(): Status;
    initialize: (callback?: Cb) => void;
    /**
     * Schedules a callback function for execution.
     * @param task of type {@linkcode Cb} The callback function to be scheduled for execution.
     */
    schedule: (task: Cb) => void;
    pause: () => void;
    stop: () => void;
    /**
     * Immediately processes the callback function, updates the status, and increments the performed count.
     *
     * @param callback of type {@linkcode Cb} The callback function to be executed immediately.
     */
    processImmediate: (callback: Cb) => void;
}
export {};
//# sourceMappingURL=scheduler.d.ts.map