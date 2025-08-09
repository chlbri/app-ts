import '../constants/errors.js';
import { DEFAULT_NOTHING } from '../constants/strings.js';
import '@bemedev/decompose';
import 'fast-deep-equal';
import { IS_TEST } from './environment.js';
import './merge.js';
import '@bemedev/types';
import './typings.js';

/**
 * A utility function used when no action is required or when a placeholder value is needed.
 *
 * @returns in text environment {@linkcode DEFAULT_NOTHING}.
 */
const nothing = () => {
    if (IS_TEST) {
        console.log(`${DEFAULT_NOTHING} call ${DEFAULT_NOTHING}`);
        return DEFAULT_NOTHING;
        /* v8 ignore next 3 */
    }
    return;
};

export { nothing };
//# sourceMappingURL=nothing.js.map
