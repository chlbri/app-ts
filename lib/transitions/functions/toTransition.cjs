'use strict';

require('@bemedev/decompose');
require('fast-deep-equal');
require('../../utils/environment.cjs');
require('../../utils/merge.cjs');
require('../../constants/errors.cjs');
require('@bemedev/types');
require('../../utils/typings.cjs');
var actions_functions_toAction = require('../../actions/functions/toAction.cjs');
require('../../machine/functions/create.cjs');
require('../../machine/functions/subcriber/contexts.cjs');
var basifun = require('@bemedev/basifun');
require('../../machine/machine.cjs');
var guards_functions_toPredicate = require('../../guards/functions/toPredicate.cjs');

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
    const actions = basifun.toArray
        .typed(config.actions)
        .map(action => actions_functions_toAction.toAction(events, promisees, action, options?.actions));
    const guards = basifun.toArray(config.guards).map(guard => guards_functions_toPredicate.toPredicate(events, promisees, guard, options?.predicates));
    const out = { target, actions, guards };
    if (description)
        out.description = description;
    return out;
};

exports.toTransition = toTransition;
//# sourceMappingURL=toTransition.cjs.map
