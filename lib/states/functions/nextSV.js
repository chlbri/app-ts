import '../../constants/errors.js';
import { DEFAULT_DELIMITER } from '../../constants/strings.js';
import { isString } from '../../types/primitives.js';
import { decompose, decomposeKeys, recompose } from '@bemedev/decompose';
import 'fast-deep-equal';
import '../../utils/environment.js';
import '../../utils/merge.js';
import { castings } from '@bemedev/types';
import { deleteFirst } from '../../utils/strings/deleteFirst.js';
import { isStringEmpty } from '../../utils/strings/isStringEmpty.js';
import { recomposeSV } from '../../utils/strings/recomposeSV.js';
import { replaceAll } from '../../utils/strings/replaceAll.js';
import '../../utils/typings.js';

/**
 * Returns the next state value based on the current state value and a target string.
 *
 * @param from - The current state value, which can be a string or an object.
 * @param target - The target string to transition to. If not provided, the function returns the current state value.
 * @returns The next state value based on the provided conditions.
 *
 * @see {@linkcode NextStateValue_F} for more type details of this function.
 * @see {@linkcode isStringEmpty} for checking if a string is empty
 * @see {@linkcode castings} for checking if a value is defined
 * @see {@linkcode isString} for checking if a value is a string
 * @see {@linkcode decompose} for decomposing objects into key-value pairs
 * @see {@linkcode recompose} for recomposing key-value pairs into an object
 * @see {@linkcode recomposeSV} for recomposing state values
 * @see {@linkcode replaceAll} for replacing all occurrences of a substring in a string
 * @see {@linkcode deleteFirst} for deleting the first occurrence of a substring in a string
 * @see {@linkcode decomposeKeys} for getting the keys of an object after decomposition
 * @see {@linkcode DEFAULT_DELIMITER} for the default delimiter used in state paths
 */
const nextSV = (from, target) => {
    const isFromEmpty = isStringEmpty(from);
    if (isFromEmpty)
        return {};
    const isTargetDefined = castings.commons.isDefined(target);
    if (!isTargetDefined)
        return from;
    const targetIsEmpty = isStringEmpty(target);
    if (targetIsEmpty)
        return from;
    const check11 = !target.startsWith('/');
    if (check11)
        return from;
    const check2 = isString(from);
    if (check2) {
        const check31 = target.includes(`${from}/`);
        if (check31) {
            const out = recomposeSV(target);
            return out;
        }
        return target;
    }
    const keys = Object.keys(from);
    const check4 = keys.length === 0;
    if (check4)
        return from;
    const decomposed = castings.commons.any(decompose(castings.objects.trueObject.forceCast(from), {
        start: false,
    }));
    const last = target.lastIndexOf(DEFAULT_DELIMITER);
    const entry = target.substring(0, last);
    const _target2 = replaceAll({
        entry,
        match: DEFAULT_DELIMITER,
        replacement: '.',
    });
    const target2 = deleteFirst(_target2, '.');
    const keysD = decomposeKeys(from);
    const check5 = keysD.includes(target2);
    if (check5) {
        decomposed[target2] = target.substring(last + 1);
    }
    else
        return target;
    const out = recompose(decomposed);
    return out;
};

export { nextSV };
//# sourceMappingURL=nextSV.js.map
