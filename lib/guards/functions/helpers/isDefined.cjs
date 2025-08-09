'use strict';

var guards_functions_helpers_value = require('./value.cjs');

/**
 * Checks if the given path is defined (not undefined or null).
 * @param path : A {@linkcode DefinedValue}, the path to retrieve.
 * @returns A {@linkcode FnR} function that returns true if the path is defined, false otherwise.
 *
 * @see {@linkcode isNotValue} for more details.
 * @see {@linkcode EventsMap}
 * @see {@linkcode PromiseeMap}
 * @see {@linkcode types.PrimitiveObject}
 *
 */
const isDefinedS = path => {
    return guards_functions_helpers_value.isNotValue(path, undefined, null);
};
/**
 * Checks if the given path is undefined or null.
 * @param path : A {@linkcode DefinedValue} , the path to retrieve.
 * @returns A {@linkcode FnR} function that returns true if the path is undefined or null, false otherwise.
 *
 * @see {@linkcode isValue} for more details.
 * @see {@linkcode EventsMap}
 * @see {@linkcode PromiseeMap}
 * @see {@linkcode types.PrimitiveObject}
 */
const isNotDefinedS = path => {
    return guards_functions_helpers_value.isValue(path, undefined, null);
};

exports.isDefinedS = isDefinedS;
exports.isNotDefinedS = isNotDefinedS;
//# sourceMappingURL=isDefined.cjs.map
