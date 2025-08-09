import '../../constants/errors.js';
import { DEFAULT_DELIMITER } from '../../constants/strings.js';
import { flatByKey } from '@bemedev/decompose';

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
const flatMap = (node, children, sep = DEFAULT_DELIMITER) => {
    return flatByKey.low(node, 'states', {
        children,
        sep,
    });
};

export { flatMap };
//# sourceMappingURL=flatMap.js.map
