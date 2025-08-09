import { isDescriber } from '../../types/primitives.js';

/**
 * Reduces an ActionConfig to its name if it is a describer, otherwise returns the action as is.
 * @param action of type {@linkcode ActionConfig}, action to reduce
 * @returns prop "name" if the action is a describer, otherwise the action itself.
 *
 * @see {@linkcode isDescriber} for more details.
 */
const reduceAction = action => {
    if (isDescriber(action))
        return action.name;
    return action;
};

export { reduceAction };
//# sourceMappingURL=reduceAction.js.map
