'use strict';

/**
 * Determines the type of state based on its configuration.
 *
 * @param config - The state configuration object.
 * @returns The type of the state: 'atomic', 'compound', or the specified type.
 *
 * @see {@linkcode StateType_F} for more details.
 */
const stateType = config => {
    const type = config.type;
    if (type)
        return type;
    const states = config.states;
    if (states) {
        const len = Object.keys(states).length;
        if (len > 0) {
            return 'compound';
        }
    }
    return 'atomic';
};

exports.stateType = stateType;
//# sourceMappingURL=stateType.cjs.map
