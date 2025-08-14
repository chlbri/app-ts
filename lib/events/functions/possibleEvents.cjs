'use strict';

var basifun = require('@bemedev/basifun');

/**
 * Returns a list of all possible events from a flat record of NodeConfig.
 * @param flat of type {@linkcode RecordS}<{@linkcode NodeConfig}>, a flat record of NodeConfig.
 * @returns An array of event names.
 *
 * @see {@linkcode isDefined} for the utility function to check if a value is defined.
 */
const possibleEvents = (flat) => {
    const events = [];
    const values = Object.values(flat);
    values.forEach(value => {
        const on = value.on;
        const check = basifun.isDefined(on);
        if (check) {
            events.push(...Object.keys(on));
        }
    });
    return events;
};

exports.possibleEvents = possibleEvents;
//# sourceMappingURL=possibleEvents.cjs.map
