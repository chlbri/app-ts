'use strict';

require('../../constants/errors.cjs');
var constants_strings = require('../../constants/strings.cjs');
var decompose = require('@bemedev/decompose');
require('fast-deep-equal');
require('../../utils/environment.cjs');
require('../../utils/merge.cjs');
var types = require('@bemedev/types');
var types_primitives = require('../../types/primitives.cjs');
var utils_strings_deleteFirst = require('../../utils/strings/deleteFirst.cjs');
var utils_strings_isStringEmpty = require('../../utils/strings/isStringEmpty.cjs');
var utils_strings_recomposeSV = require('../../utils/strings/recomposeSV.cjs');
var utils_strings_replaceAll = require('../../utils/strings/replaceAll.cjs');
require('../../utils/typings.cjs');

/**
 * Returns the next state value based on the current state value and a target string.
 *
 * @param from - The current state value, which can be a string or an object.
 * @param target - The target string to transition to. If not provided, the function returns the current state value.
 * @returns The next state value based on the provided conditions.
 *
 * @see {@linkcode NextStateValue_F} for more type details of this function.
 * @see {@linkcode isStringEmpty} for checking if a string is empty
 * @see {@linkcode castings} for checking if a value is defined
 * @see {@linkcode isString} for checking if a value is a string
 * @see {@linkcode decompose} for decomposing objects into key-value pairs
 * @see {@linkcode recompose} for recomposing key-value pairs into an object
 * @see {@linkcode recomposeSV} for recomposing state values
 * @see {@linkcode replaceAll} for replacing all occurrences of a substring in a string
 * @see {@linkcode deleteFirst} for deleting the first occurrence of a substring in a string
 * @see {@linkcode decomposeKeys} for getting the keys of an object after decomposition
 * @see {@linkcode DEFAULT_DELIMITER} for the default delimiter used in state paths
 */
const nextSV = (from, target) => {
    const isFromEmpty = utils_strings_isStringEmpty.isStringEmpty(from);
    if (isFromEmpty)
        return {};
    const isTargetDefined = types.castings.commons.isDefined(target);
    if (!isTargetDefined)
        return from;
    const targetIsEmpty = utils_strings_isStringEmpty.isStringEmpty(target);
    if (targetIsEmpty)
        return from;
    const check11 = !target.startsWith('/');
    if (check11)
        return from;
    const check2 = types_primitives.isString(from);
    if (check2) {
        const check31 = target.includes(`${from}/`);
        if (check31) {
            const out = utils_strings_recomposeSV.recomposeSV(target);
            return out;
        }
        return target;
    }
    const keys = Object.keys(from);
    const check4 = keys.length === 0;
    if (check4)
        return from;
    const decomposed = types.castings.commons.any(decompose.decompose(types.castings.objects.trueObject.forceCast(from), {
        start: false,
    }));
    const last = target.lastIndexOf(constants_strings.DEFAULT_DELIMITER);
    const entry = target.substring(0, last);
    const _target2 = utils_strings_replaceAll.replaceAll({
        entry,
        match: constants_strings.DEFAULT_DELIMITER,
        replacement: '.',
    });
    const target2 = utils_strings_deleteFirst.deleteFirst(_target2, '.');
    const keysD = decompose.decomposeKeys(from);
    const check5 = keysD.includes(target2);
    if (check5) {
        decomposed[target2] = target.substring(last + 1);
    }
    else
        return target;
    const out = decompose.recompose(decomposed);
    return out;
};

exports.nextSV = nextSV;
//# sourceMappingURL=nextSV.cjs.map
