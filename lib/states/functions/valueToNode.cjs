'use strict';

require('../../constants/errors.cjs');
var constants_strings = require('../../constants/strings.cjs');
var decompose = require('@bemedev/decompose');
require('fast-deep-equal');
require('../../utils/environment.cjs');
require('../../utils/merge.cjs');
require('@bemedev/types');
var types_primitives = require('../../types/primitives.cjs');
var utils_strings_replaceAll = require('../../utils/strings/replaceAll.cjs');
require('../../utils/typings.cjs');
var states_functions_flatMap = require('./flatMap.cjs');
var states_functions_getChildren = require('./getChildren.cjs');
var states_functions_getParents = require('./getParents.cjs');
var states_functions_recompose = require('./recompose.cjs');

/**
 * Converts a state value to a node configuration based on the provided body and from value.
 *
 * @param body - The node configuration body to convert from.
 * @param from - The state value to convert to a node configuration.
 * @param initial - Optional flag to indicate if the initial state should be included.
 * @returns A node configuration object that represents the state value.
 *
 * @see {@linkcode ValueToNode_F} for more details
 * @see {@linkcode flatMap} for flattening the node configuration
 * @see {@linkcode getChildren} for retrieving child states
 * @see {@linkcode getParents} for retrieving parent states
 * @see {@linkcode recomposeConfig} for recomposing the node configuration
 * @see {@linkcode decomposeSV} for decomposing state values
 * @see {@linkcode replaceAll} for replacing substrings in the state value
 * @see {@linkcode DEFAULT_DELIMITER} for the default delimiter used in state paths
 */
const valueToNode = (body, from) => {
    const flatBody = states_functions_flatMap.flatMap(body, false);
    const keysFlatBody = Object.keys(flatBody);
    const fromIsString = types_primitives.isString(from);
    if (fromIsString) {
        const check2 = keysFlatBody.includes(from);
        if (check2) {
            const parents = states_functions_getParents.getParents(from);
            const children = states_functions_getChildren.getChildren(from, ...keysFlatBody);
            const out1 = {};
            parents.concat(children).forEach(key => {
                out1[key] = flatBody[key];
            });
            const out = states_functions_recompose.recomposeConfig(out1);
            return out;
        }
        return {};
    }
    const flatFrom = decompose.decomposeSV(from)
        .map(key => utils_strings_replaceAll.replaceAll({
        entry: key,
        match: '.',
        replacement: constants_strings.DEFAULT_DELIMITER,
    }))
        .map(key => `/${key}`);
    const out1 = {};
    flatFrom.forEach((key1, _, all) => {
        const check4 = keysFlatBody.some(key => key.startsWith(key1));
        if (check4) {
            out1[key1] = flatBody[key1];
            const initial = flatBody[key1].initial;
            if (initial) {
                const _initial = `${key1}${constants_strings.DEFAULT_DELIMITER}${initial}`;
                const cannotContinue = all.some(key => key.startsWith(`${key1}${constants_strings.DEFAULT_DELIMITER}`));
                if (cannotContinue)
                    return;
                out1[_initial] = flatBody[_initial];
            }
        }
    });
    const out2 = states_functions_recompose.recomposeConfig(out1);
    return out2;
};

exports.valueToNode = valueToNode;
//# sourceMappingURL=valueToNode.cjs.map
