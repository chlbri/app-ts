'use strict';

var types_primitives = require('../../types/primitives.cjs');

/**
 * Reduces an ActionConfig to its name if it is a describer, otherwise returns the action as is.
 * @param action of type {@linkcode ActionConfig}, action to reduce
 * @returns prop "name" if the action is a describer, otherwise the action itself.
 *
 * @see {@linkcode isDescriber} for more details.
 */
const reduceAction = action => {
    if (types_primitives.isDescriber(action))
        return action.name;
    return action;
};

exports.reduceAction = reduceAction;
//# sourceMappingURL=reduceAction.cjs.map
