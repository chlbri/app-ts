import '@bemedev/decompose';
import 'fast-deep-equal';
import '../utils/environment.js';
import '../utils/merge.js';
import '../constants/errors.js';
import { checkKeys } from '../utils/objects/checkKeys.js';
import '@bemedev/types';
import '../utils/typings.js';

/**
 * Describer keys used to define the name and description of an object.
 */
const DESCRIBER_KEYS = ['name', 'description'];
const isFunction = (value) => {
    return typeof value === 'function';
};
const isString = value => {
    return typeof value === 'string';
};
const isDescriber = (arg) => {
    const out = checkKeys(arg, ...DESCRIBER_KEYS);
    return out;
};

export { DESCRIBER_KEYS, isDescriber, isFunction, isString };
//# sourceMappingURL=primitives.js.map
