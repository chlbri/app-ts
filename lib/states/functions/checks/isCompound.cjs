'use strict';

var states_functions_stateType = require('../stateType.cjs');

function isCompound(arg) {
    const out = states_functions_stateType.stateType(arg) === 'compound';
    return out;
}

exports.isCompound = isCompound;
//# sourceMappingURL=isCompound.cjs.map
