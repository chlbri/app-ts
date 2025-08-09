'use strict';

var types = require('@bemedev/types');
var states_functions_checks_isCompound = require('./checks/isCompound.cjs');
var states_functions_checks_isAtomic = require('./checks/isAtomic.cjs');

/**
 * Converts a state machine config into a StateValue.
 *
 * @param body - The state machine configuration to process.
 * @returns A value representation of the state machine, which can be a string,
 *         an object, or an empty object if the state is atomic.
 *
 * @see {@linkcode NodeToValue_F} for more details
 * @see {@linkcode isAtomic} for checking atomic states
 * @see {@linkcode isCompound} for checking compound states
 * @see {@linkcode t} for type utilities
 */
const nodeToValue = body => {
    const check1 = states_functions_checks_isAtomic.isAtomic(body);
    if (check1)
        return {};
    const entries = Object.entries(body.states);
    const check2 = states_functions_checks_isCompound.isCompound(body);
    if (check2) {
        // const length = entries.length;
        const __id = body.initial;
        const initial = body.states[__id];
        const check4 = !!initial && states_functions_checks_isAtomic.isAtomic(initial);
        if (check4)
            return __id;
        const keys = Object.keys(body.states);
        const check6 = keys.length === 1;
        if (check6) {
            const key = keys[0];
            const value = body.states[key];
            const check7 = states_functions_checks_isAtomic.isAtomic(value);
            if (check7)
                return key;
        }
    }
    const entries2 = entries.map(([key, value]) => types.castings.arrays.tupleOf(key, nodeToValue(value)));
    const out = entries2.reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
    }, {});
    return out;
};

exports.nodeToValue = nodeToValue;
//# sourceMappingURL=nodeToValue.cjs.map
