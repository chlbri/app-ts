'use strict';

var utils_strings_escapeRegExp = require('./escapeRegExp.cjs');

/**
 * Replaces all occurrences of a specified substring in a string with a replacement string.
 * @param params Object containing the string to modify, the substring to match, and the replacement string.
 * @returns The modified string with all occurrences replaced.
 *
 * @see {@linkcode ReplaceAll_F} for the type definition
 */
const replaceAll = ({ entry, match, replacement, }) => {
    const regex = utils_strings_escapeRegExp.escapeRegExp(match);
    return entry.replace(new RegExp(regex, 'g'), () => replacement);
};

exports.replaceAll = replaceAll;
//# sourceMappingURL=replaceAll.cjs.map
