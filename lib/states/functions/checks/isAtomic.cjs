'use strict';

var states_functions_stateType = require('../stateType.cjs');

function isAtomic(arg) {
    const out = states_functions_stateType.stateType(arg) === 'atomic';
    return out;
}

exports.isAtomic = isAtomic;
//# sourceMappingURL=isAtomic.cjs.map
