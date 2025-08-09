import '../../constants/errors.js';
import { DEFAULT_DELIMITER } from '../../constants/strings.js';
import '@bemedev/decompose';
import 'fast-deep-equal';
import '../../utils/environment.js';
import '../../utils/merge.js';
import '@bemedev/types';
import { isStringEmpty } from '../../utils/strings/isStringEmpty.js';
import '../../utils/typings.js';

const _getParents = value => {
    const last = value.lastIndexOf(DEFAULT_DELIMITER);
    const out = new Set('/');
    out.add(value);
    const str2 = value.substring(0, last);
    if (isStringEmpty(str2)) {
        return Array.from(out);
    }
    const inner = _getParents(str2);
    inner.forEach(v => out.add(v));
    return Array.from(out);
};
/**
 * Returns an array of parent paths for the given path.
 * @param value - The path to get parents for.
 * @returns An array of parent paths.
 *
 * @see {@linkcode GetParents_F} for type details.
 * @see {@linkcode _getParents} for the implementation.
 */
const getParents = _getParents;

export { getParents };
//# sourceMappingURL=getParents.js.map
