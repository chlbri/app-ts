/**
 * The first event in the machine lifecycle.
 * This event is used to initialize the machine.
 */
export declare const INIT_EVENT = "machine$$init";
/**
 * The event that is triggered when the machine peforms an always transition.
 */
export declare const ALWAYS_EVENT = "machine$$always";
/**
 * The event that is triggered when the machine peforms an after transition.
 */
export declare const AFTER_EVENT = "machine$$after";
/**
 * The event that is triggered when the machine exceeds its maximum allowed transitions.
 * This is used to prevent infinite loops or excessive transitions.
 */
export declare const MAX_EXCEEDED_EVENT_TYPE = "machine$$exceeded";
//# sourceMappingURL=constants.d.ts.map