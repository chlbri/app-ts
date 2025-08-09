import { stateType } from '../stateType.js';

function isCompound(arg) {
    const out = stateType(arg) === 'compound';
    return out;
}

export { isCompound };
//# sourceMappingURL=isCompound.js.map
