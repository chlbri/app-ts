import '@bemedev/decompose';
import 'fast-deep-equal';
import '../../utils/environment.js';
import '../../utils/merge.js';
import '../../constants/errors.js';
import '@bemedev/types';
import '../../utils/typings.js';
import { toAction } from '../../actions/functions/toAction.js';
import '../../machine/functions/create.js';
import '../../machine/functions/subcriber/contexts.js';
import { toArray } from '@bemedev/basifun';
import '../../machine/machine.js';
import { toPredicate } from '../../guards/functions/toPredicate.js';

/**
 * Converts a transition configuration to a structured transition object with all functions.
 *
 * @param events - The events map used for action and guard resolution.
 * @param promisees - The promisees map used for promise resolution.
 * @param config - The transition configuration to convert.
 * @param options - Optional machine options that may include actions and predicates configurations.
 * @returns A structured transition object with target, actions, guards, and optional description.
 *
 * @see {@linkcode ToTransition_F} for more details
 * @see {@linkcode toAction} for converting actions
 * @see {@linkcode toPredicate} for converting guards
 * @see {@linkcode toArray.typed} for ensuring typed arrays
 * @see {@linkcode toArray} for ensuring typed arrays
 */
const toTransition = (events, promisees, config, options) => {
    const { description, target } = config;
    const actions = toArray
        .typed(config.actions)
        .map(action => toAction(events, promisees, action, options?.actions));
    const guards = toArray(config.guards).map(guard => toPredicate(events, promisees, guard, options?.predicates));
    const out = { target, actions, guards };
    if (description)
        out.description = description;
    return out;
};

export { toTransition };
//# sourceMappingURL=toTransition.js.map
