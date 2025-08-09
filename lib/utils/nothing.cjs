'use strict';

require('../constants/errors.cjs');
var constants_strings = require('../constants/strings.cjs');
require('@bemedev/decompose');
require('fast-deep-equal');
var utils_environment = require('./environment.cjs');
require('./merge.cjs');
require('@bemedev/types');
require('./typings.cjs');

/**
 * A utility function used when no action is required or when a placeholder value is needed.
 *
 * @returns in text environment {@linkcode DEFAULT_NOTHING}.
 */
const nothing = () => {
    if (utils_environment.IS_TEST) {
        console.log(`${constants_strings.DEFAULT_NOTHING} call ${constants_strings.DEFAULT_NOTHING}`);
        return constants_strings.DEFAULT_NOTHING;
        /* v8 ignore next 3 */
    }
    return;
};

exports.nothing = nothing;
//# sourceMappingURL=nothing.cjs.map
