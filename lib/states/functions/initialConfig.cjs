'use strict';

var types = require('@bemedev/types');
var states_functions_checks_isParallel = require('./checks/isParallel.cjs');
var states_functions_checks_isAtomic = require('./checks/isAtomic.cjs');

/**
 * Returns the initial configuration of a state machine.
 *
 * @param body - The state machine configuration to process.
 * @returns The initial configuration of the state machine.
 *
 * @see {@linkcode isAtomic} for checking atomic states
 * @see {@linkcode isParallel} for checking parallel states
 * @see {@linkcode InitialConfig_F} for more details
 * @see {@linkcode t} for type utilities
 */
const initialConfig = body => {
    const check1 = states_functions_checks_isAtomic.isAtomic(body);
    if (check1)
        return body;
    const check2 = states_functions_checks_isParallel.isParallel(body);
    if (check2) {
        const { states: _states, ...config } = body;
        const entries1 = Object.entries(_states).map(([key, state]) => {
            const reduced = initialConfig(state);
            return types.castings.arrays.tupleOf(key, reduced);
        });
        const states = entries1.reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
        }, {});
        const out = { ...config, states };
        return out;
    }
    const __id = body.initial;
    const initial = body.states[__id];
    if (!initial) {
        const { states: _states, ...config } = body;
        const entries1 = Object.entries(_states).map(([key, state]) => {
            const reduced = initialConfig(state);
            return types.castings.arrays.tupleOf(key, reduced);
        });
        const states = entries1.reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
        }, {});
        const out = { ...config, states };
        return out;
    }
    const check4 = states_functions_checks_isAtomic.isAtomic(initial);
    if (check4) {
        const out = { ...body, states: { [__id]: initial } };
        return out;
    }
    const out = {
        ...body,
        states: { [__id]: initialConfig(initial) },
    };
    return out;
};

exports.initialConfig = initialConfig;
//# sourceMappingURL=initialConfig.cjs.map
