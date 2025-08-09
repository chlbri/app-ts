/**
 * Checks if all specified keys are present in the given object.
 * @param arg Object to check keys against
 * @param keys Keys to check for presence in the object
 * @returns `true` if all keys are present, `false` otherwise
 *
 * @see {@linkcode CheckKeys_F} for the type definition
 */
const checkKeys = (arg, ...keys) => {
    const argKeys = Object.keys(arg);
    for (const key of keys) {
        const check = !argKeys.includes(key);
        if (check)
            return false;
    }
    return true;
};

export { checkKeys };
//# sourceMappingURL=checkKeys.js.map
