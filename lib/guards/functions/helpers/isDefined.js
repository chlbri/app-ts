import { isNotValue, isValue } from './value.js';

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
    return isNotValue(path, undefined, null);
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
    return isValue(path, undefined, null);
};

export { isDefinedS, isNotDefinedS };
//# sourceMappingURL=isDefined.js.map
