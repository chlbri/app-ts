import '../../constants/errors.js';
import { DEFAULT_DELIMITER } from '../../constants/strings.js';

/**
 * Flattens a state node configuration into a map structure.
 *
 * @param node - The state node configuration to flatten.
 * @param withChildren - Whether to include child states in the output.
 * @param delimiter - The delimiter to use for paths in the output map. Defaults to {@linkcode DEFAULT_DELIMITER}.
 * @param path - The current path in the output map (used for recursion).
 * @returns A flat map of the state node configuration.
 *
 * @see {@linkcode FlatMap_F} for more details.
 */
const flatMap = (node, withChildren, delimiter = DEFAULT_DELIMITER, path = '') => {
    //TODO: use it to perform flat in @bemedev/decompose
    //TODO: Export flat in @bemedev/decompose
    const { states, ...rest } = node;
    const check = withChildren === undefined || withChildren === true;
    let out = {};
    out[path === '' ? DEFAULT_DELIMITER : path] = check ? node : rest;
    if (states) {
        for (const key in states) {
            if (Object.prototype.hasOwnProperty.call(states, key)) {
                const element = states[key];
                const inner = flatMap(element, withChildren, delimiter, `${path}${DEFAULT_DELIMITER}${key}`);
                out = { ...out, ...inner };
            }
        }
    }
    return out;
};

export { flatMap };
//# sourceMappingURL=flatMap.js.map
