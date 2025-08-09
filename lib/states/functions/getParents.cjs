'use strict';

require('../../constants/errors.cjs');
var constants_strings = require('../../constants/strings.cjs');
require('@bemedev/decompose');
require('fast-deep-equal');
require('../../utils/environment.cjs');
require('../../utils/merge.cjs');
require('@bemedev/types');
var utils_strings_isStringEmpty = require('../../utils/strings/isStringEmpty.cjs');
require('../../utils/typings.cjs');

const _getParents = value => {
    const last = value.lastIndexOf(constants_strings.DEFAULT_DELIMITER);
    const out = new Set('/');
    out.add(value);
    const str2 = value.substring(0, last);
    if (utils_strings_isStringEmpty.isStringEmpty(str2)) {
        return Array.from(out);
    }
    const inner = _getParents(str2);
    inner.forEach(v => out.add(v));
    return Array.from(out);
};
/**
 * Returns an array of parent paths for the given path.
 * @param value - The path to get parents for.
 * @returns An array of parent paths.
 *
 * @see {@linkcode GetParents_F} for type details.
 * @see {@linkcode _getParents} for the implementation.
 */
const getParents = _getParents;

exports.getParents = getParents;
//# sourceMappingURL=getParents.cjs.map
