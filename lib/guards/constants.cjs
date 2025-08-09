'use strict';

require('../constants/errors.cjs');
var constants_strings = require('../constants/strings.cjs');
require('@bemedev/decompose');
require('fast-deep-equal');
var utils_environment = require('../utils/environment.cjs');
require('../utils/merge.cjs');
require('@bemedev/types');
require('../utils/typings.cjs');

const returnTrue = () => {
    if (utils_environment.IS_TEST)
        console.log(`${constants_strings.DEFAULT_NOTHING} call true`);
    return true;
};
const returnFalse = () => {
    if (utils_environment.IS_TEST)
        console.log(`${constants_strings.DEFAULT_NOTHING} call false`);
    return false;
};

exports.returnFalse = returnFalse;
exports.returnTrue = returnTrue;
//# sourceMappingURL=constants.cjs.map
