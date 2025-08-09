'use strict';

require('../../constants/errors.cjs');
var constants_strings = require('../../constants/strings.cjs');

/**
 * Deletes the first occurrence of a specified delimiter from the start of a string.
 * @param arg  The string from which to delete the first occurrence of the specified delimiter.
 * @param toDelete The delimiter to remove from the start of the string. Defaults to {@linkcode DEFAULT_DELIMITER}.
 * @returns The modified string with the first occurrence of the specified value removed, or the original string if the delimiter is not found at the start.
 *
 * @see {@linkcode DeleteFirst_F} for the type definition
 * @see {@linkcode DEFAULT_DELIMITER} for the default delimiter used if none is specified
 */
const deleteFirst = (arg, toDelete = constants_strings.DEFAULT_DELIMITER) => {
    const check = arg.startsWith(toDelete);
    return check ? arg.substring(1) : arg;
};

exports.deleteFirst = deleteFirst;
//# sourceMappingURL=deleteFirst.cjs.map
