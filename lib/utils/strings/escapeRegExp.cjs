'use strict';

require('../../constants/errors.cjs');
var constants_strings = require('../../constants/strings.cjs');

/**
 * Escapes special characters in a string to be used in a regular expression.
 * @param arg The string to escape.
 * @returns The escaped string, where special characters are prefixed with a `'\\$&'`.
 *
 * @see {@linkcode EscapeRexExp_F} for the type definition
 * @see {@linkcode ESCAPE_REGEXP} for the regular expression used to identify special characters.
 */
const escapeRegExp = arg => {
    const replacer = '\\$&';
    return arg.replace(constants_strings.ESCAPE_REGEXP, replacer);
};

exports.escapeRegExp = escapeRegExp;
//# sourceMappingURL=escapeRegExp.cjs.map
