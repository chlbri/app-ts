'use strict';

require('@bemedev/decompose');
require('fast-deep-equal');
require('../../utils/environment.cjs');
require('../../utils/merge.cjs');
require('../../constants/errors.cjs');
var utils_reduceFnMap = require('../../utils/reduceFnMap.cjs');
require('../../utils/typings.cjs');
var machine_functions_subcriber_contexts = require('./subcriber/contexts.cjs');
require('@bemedev/basifun');

/**
 *
 * @param events : type {@linkcode EventsMap} [E] - The events map.
 * @param promisees  : type {@linkcode PromiseeMap} [P] - The promisees map.
 * @param key  : type {@linkcode Decompose} [D] - The key to assign the result to in the context and the private context.
 * @param fn  : type {@linkcode FnMap} [E, P, Pc, Tc, R] - The function to reduce the events and promisees and performs the action.
 * @returns a {@linkcode ActionResultFn} function.
 *
 * @see {@linkcode assignByKey} for assigning the result to the context and private context.
 * @see {@linkcode reduceFnMap} for reducing the events and promisees.
 * @see {@linkcode Decompose} for decomposing the private context and context into paths.
 *
 */
const expandFnMap = (events, promisees, key, fn) => {
    const _fn = utils_reduceFnMap.reduceFnMap(events, promisees, fn);
    return ({ pContext, context, ...rest }) => {
        const all = {
            pContext,
            context,
        };
        const result = _fn({ pContext, context, ...rest });
        return machine_functions_subcriber_contexts.assignByKey(all, key, result);
    };
};

exports.expandFnMap = expandFnMap;
//# sourceMappingURL=expandFnMap.cjs.map
