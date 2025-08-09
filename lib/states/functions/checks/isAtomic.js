import { stateType } from '../stateType.js';

function isAtomic(arg) {
    const out = stateType(arg) === 'atomic';
    return out;
}

export { isAtomic };
//# sourceMappingURL=isAtomic.js.map
