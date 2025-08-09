'use strict';

var decompose = require('@bemedev/decompose');

const _assignByKey = (obj, key, value) => {
    const out = obj;
    const keys = key.split('.');
    const check1 = keys.length === 1;
    if (check1) {
        out[key] = value;
        return out;
    }
    out[keys[0]] = _assignByKey(out[keys[0]], keys.slice(1).join('.'), value);
    return out;
};
/**
 * Assigns a value to a path in an object.
 * @param obj The object to assign the value to
 * @param path The key to assign the value to, can be a nested key (e.g. 'a.b.c')
 * @param value The value to assign to the key
 * @returns The modified object with the value assigned to the specified key
 *
 * @see {@linkcode Decompose} for more details on object decomposition.
 */
const assignByKey = (obj, path, value) => {
    return _assignByKey(obj, path, value);
};
assignByKey.low = _assignByKey;
assignByKey.typed = _assignByKey;
const _getByKey = (obj, key) => {
    const decomposed = decompose.decompose.low(obj, { start: false });
    return decomposed[key];
};
/**
 * Retrieves a value from an object by a specified key.
 * @param obj The object to retrieve the value from
 * @param key The key to retrieve the value for, can be a nested key (e.g. 'a.b.c')
 * @returns The value associated with the specified key in the object
 *
 * @see {@linkcode Decompose} for more details on object decomposition.
 */
const getByKey = (obj, key) => _getByKey(obj, key);
getByKey.low = _getByKey;
getByKey.typed = _getByKey;
const _mergeByKey = () => {
    return (key, value) => {
        const out = {};
        const keys = key.toLocaleString().split('.');
        const check1 = keys.length === 1;
        if (check1) {
            out[key] = value;
        }
        else {
            out[keys[0]] = _mergeByKey(out[keys[0]])(keys.slice(1).join('.'), value);
        }
        return out;
    };
};
/**
 * Creates a function that merges a value into an object at a specified key path.
 * @param obj The object to merge the value into
 * @returns A function that takes a key and a value, and merges the value into the object at the specified key path
 *
 * @see {@linkcode Decompose} for more details on object decomposition.
 */
const mergeByKey = obj => _mergeByKey();
mergeByKey.low = _mergeByKey;
mergeByKey.typed = _mergeByKey;

exports.assignByKey = assignByKey;
exports.getByKey = getByKey;
exports.mergeByKey = mergeByKey;
//# sourceMappingURL=contexts.cjs.map
