import '../../constants/errors.js';
import { DEFAULT_DELIMITER } from '../../constants/strings.js';
import { isString } from '../../types/primitives.js';
import { decomposeSV } from '@bemedev/decompose';
import 'fast-deep-equal';
import '../../utils/environment.js';
import '../../utils/merge.js';
import '@bemedev/types';
import { replaceAll } from '../../utils/strings/replaceAll.js';
import '../../utils/typings.js';
import { flatMap } from './flatMap.js';
import { getChildren } from './getChildren.js';
import { getParents } from './getParents.js';
import { recomposeConfig } from './recompose.js';

/**
 * Converts a state value to a node configuration based on the provided body and from value.
 *
 * @param body - The node configuration body to convert from.
 * @param from - The state value to convert to a node configuration.
 * @param initial - Optional flag to indicate if the initial state should be included.
 * @returns A node configuration object that represents the state value.
 *
 * @see {@linkcode ValueToNode_F} for more details
 * @see {@linkcode flatMap} for flattening the node configuration
 * @see {@linkcode getChildren} for retrieving child states
 * @see {@linkcode getParents} for retrieving parent states
 * @see {@linkcode recomposeConfig} for recomposing the node configuration
 * @see {@linkcode decomposeSV} for decomposing state values
 * @see {@linkcode replaceAll} for replacing substrings in the state value
 * @see {@linkcode DEFAULT_DELIMITER} for the default delimiter used in state paths
 */
const valueToNode = (body, from) => {
    const flatBody = flatMap(body, false);
    const keysFlatBody = Object.keys(flatBody);
    const fromIsString = isString(from);
    if (fromIsString) {
        const check2 = keysFlatBody.includes(from);
        if (check2) {
            const parents = getParents(from);
            const children = getChildren(from, ...keysFlatBody);
            const out1 = {};
            parents.concat(children).forEach(key => {
                out1[key] = flatBody[key];
            });
            const out = recomposeConfig(out1);
            return out;
        }
        return {};
    }
    const flatFrom = decomposeSV(from)
        .map(key => replaceAll({
        entry: key,
        match: '.',
        replacement: DEFAULT_DELIMITER,
    }))
        .map(key => `/${key}`);
    const out1 = {};
    flatFrom.forEach((key1, _, all) => {
        const check4 = keysFlatBody.some(key => key.startsWith(key1));
        if (check4) {
            out1[key1] = flatBody[key1];
            const initial = flatBody[key1].initial;
            if (initial) {
                const _initial = `${key1}${DEFAULT_DELIMITER}${initial}`;
                const cannotContinue = all.some(key => key.startsWith(`${key1}${DEFAULT_DELIMITER}`));
                if (cannotContinue)
                    return;
                out1[_initial] = flatBody[_initial];
            }
        }
    });
    const out2 = recomposeConfig(out1);
    return out2;
};

export { valueToNode };
//# sourceMappingURL=valueToNode.js.map
