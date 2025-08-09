'use strict';

var events_constants = require('../constants.cjs');

const VALUES = [events_constants.INIT_EVENT, events_constants.MAX_EXCEEDED_EVENT_TYPE];
/**
 * Checks if the provided event is a {@linkcode EventStrings}.
 * @param event of type any, the event to check
 * @returns true if the event is a {@linkcode EventStrings}
 * @satisfies typechecker
 *
 * @see {@linkcode INIT_EVENT} for the initial event.
 * @see {@linkcode ALWAYS_EVENT} for the always event.
 * @see {@linkcode AFTER_EVENT} for the after event.
 * @see {@linkcode MAX_EXCEEDED_EVENT_TYPE} for the max exceeded event.
 */
const isStringEvent = (event) => {
    const out = typeof event === 'string' &&
        (VALUES.includes(event) ||
            event.endsWith(events_constants.ALWAYS_EVENT) ||
            event.endsWith(events_constants.AFTER_EVENT));
    return out;
};

exports.isStringEvent = isStringEvent;
//# sourceMappingURL=isStringEvent.cjs.map
