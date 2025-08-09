/**
 * The first event in the machine lifecycle.
 * This event is used to initialize the machine.
 */
const INIT_EVENT = 'machine$$init';
/**
 * The event that is triggered when the machine peforms an always transition.
 */
const ALWAYS_EVENT = 'machine$$always';
/**
 * The event that is triggered when the machine peforms an after transition.
 */
const AFTER_EVENT = 'machine$$after';
/**
 * The event that is triggered when the machine exceeds its maximum allowed transitions.
 * This is used to prevent infinite loops or excessive transitions.
 */
const MAX_EXCEEDED_EVENT_TYPE = 'machine$$exceeded';

export { AFTER_EVENT, ALWAYS_EVENT, INIT_EVENT, MAX_EXCEEDED_EVENT_TYPE };
//# sourceMappingURL=constants.js.map
