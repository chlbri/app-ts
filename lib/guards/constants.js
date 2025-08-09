import '../constants/errors.js';
import { DEFAULT_NOTHING } from '../constants/strings.js';
import '@bemedev/decompose';
import 'fast-deep-equal';
import { IS_TEST } from '../utils/environment.js';
import '../utils/merge.js';
import '@bemedev/types';
import '../utils/typings.js';

const returnTrue = () => {
    if (IS_TEST)
        console.log(`${DEFAULT_NOTHING} call true`);
    return true;
};
const returnFalse = () => {
    if (IS_TEST)
        console.log(`${DEFAULT_NOTHING} call false`);
    return false;
};

export { returnFalse, returnTrue };
//# sourceMappingURL=constants.js.map
