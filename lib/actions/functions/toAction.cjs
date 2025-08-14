'use strict';

require('@bemedev/decompose');
require('fast-deep-equal');
require('../../utils/environment.cjs');
require('../../utils/merge.cjs');
require('../../constants/errors.cjs');
var utils_reduceFnMap = require('../../utils/reduceFnMap.cjs');
var types_primitives = require('../../types/primitives.cjs');
require('../../utils/typings.cjs');

/**
 * Converts an ActionConfig to a function that can be executed with the provided eventsMap and promisees.
 * @param events of type {@linkcode EventsMap}, events map to use for resolving the action.
 * @param promisees of type {@linkcode PromiseeMap}, the promisees map to use for resolving the action.
 * @param action of type {@linkcode ActionConfig}, action configuration to convert.
 * @param actions of type {@linkcode ActionMap}, The actions map containing functions to execute.
 *
 * @see {@linkcode types.PrimitiveObject}
 * @see {@linkcode ActionResult}
 * @see {@linkcode reduceFnMap}
 * @see {@linkcode isDescriber}
 */
const toAction = (events, promisees, action, actions) => {
    if (types_primitives.isDescriber(action)) {
        const fn = actions?.[action.name];
        const func = fn ? utils_reduceFnMap.reduceFnMap(events, promisees, fn) : undefined;
        return func;
    }
    const fn = actions?.[action];
    const func = fn ? utils_reduceFnMap.reduceFnMap(events, promisees, fn) : undefined;
    return func;
};

exports.toAction = toAction;
//# sourceMappingURL=toAction.cjs.map
