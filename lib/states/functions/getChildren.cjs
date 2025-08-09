'use strict';

/**
 * Returns an array of keys that are included the given string, excluding the string itself.
 * @param str - The string to check against.
 * @param keys - The keys to check.
 * @returns An array of keys that include the given string, excluding the string itself.
 */
const getChildren = (str, ...keys) => {
    const noKeys = keys.length > 0;
    const out = [];
    if (noKeys) {
        keys.forEach(key => {
            const notMatch = str !== key;
            const check3 = key.startsWith(str);
            const check4 = notMatch && check3;
            if (check4) {
                out.push(key);
            }
        });
    }
    return out;
};

exports.getChildren = getChildren;
//# sourceMappingURL=getChildren.cjs.map
