'use strict';

require('@bemedev/decompose');
require('fast-deep-equal');
require('../../utils/environment.cjs');
require('../../utils/merge.cjs');
require('../../constants/errors.cjs');
var types = require('@bemedev/types');
require('../../utils/typings.cjs');
var actions_functions_toAction = require('../../actions/functions/toAction.cjs');
var promises_functions_toPromise = require('../../promises/functions/toPromise.cjs');
var transitions_functions_toTransition = require('../../transitions/functions/toTransition.cjs');
var basifun = require('@bemedev/basifun');
var identify = require('@bemedev/basifun/objects/identify');
var states_functions_stateType = require('./stateType.cjs');

/**
 * Resolves a node configuration into a full node with all functions.
 *
 * @param events - The events map used for action and transition resolution.
 * @param promisees - The promisees map used for promise resolution.
 * @param config - The node configuration to resolve.
 * @param options - Optional machine options that may include actions and promises configurations.
 * @returns A structured representation of the node with its properties and transitions.
 *
 * @see {@linkcode ResolveNode_F} for more details
 * @see {@linkcode toAction} for converting actions
 * @see {@linkcode toTransition} for converting transitions
 * @see {@linkcode toPromise} for converting promises
 * @see {@linkcode toArray.typed} for ensuring typed arrays
 * @see {@linkcode stateType} for determining the type of the state
 * @see {@linkcode identify} for identifying properties in the configuration
 *
 */
const resolveNode = (events, promisees, config, options) => {
    // #region functions for mapping
    const aMapper = (action) => {
        return actions_functions_toAction.toAction(events, promisees, action, options?.actions);
    };
    const tMapper = (config) => {
        return transitions_functions_toTransition.toTransition(events, promisees, config, options);
    };
    // #endregion
    const { description, initial, tags: _tags } = config;
    const __id = config.__id;
    const type = states_functions_stateType.stateType(config);
    const tags = basifun.toArray.typed(_tags);
    const entry = basifun.toArray.typed(config.entry).map(aMapper);
    const exit = basifun.toArray.typed(config.exit).map(aMapper);
    const states = identify.identify(config.states).map(config => resolveNode(events, promisees, config, options));
    const on = identify.identify(config.on).map(tMapper);
    const always = basifun.toArray.typed(config.always).map(tMapper);
    const after = identify.identify(config.after).map(tMapper);
    const promises = basifun.toArray
        .typed(config.promises)
        .map(promise => promises_functions_toPromise.toPromise(events, promisees, promise, options));
    const out = types.castings.commons.any({
        type,
        entry,
        exit,
        tags,
        states,
        on,
        always,
        after,
        promises,
    });
    if (__id)
        out.__id = __id;
    if (initial)
        out.initial = initial;
    if (description)
        out.description = description;
    return out;
};

exports.resolveNode = resolveNode;
//# sourceMappingURL=resolveNode.cjs.map
