'use strict';

const transformTypes = (type) => {
    const out = type === 'primitive' ? {} : undefined;
    return out;
};
const CUSTOM = '$$app-ts => custom$$';
const PARTIAL = '$$app-ts => partial$$';
const transformPrimitiveObject = (obj) => {
    const _obj = obj;
    const checkArray = Array.isArray(_obj);
    if (checkArray) {
        return _obj.map(transformPrimitiveObject);
    }
    const checkObject = typeof _obj === 'object';
    if (checkObject) {
        const isCustom = Object.keys(_obj).every(key => key === CUSTOM);
        const out = {};
        if (isCustom)
            return out;
        const entries = Object.entries(_obj).filter(([key]) => key !== PARTIAL);
        entries.forEach(([key, value]) => {
            out[key] = transformPrimitiveObject(value);
        });
        return out;
    }
    return transformTypes(_obj);
};
const DEFAULT_ARGS = {
    eventsMap: 'primitive',
    pContext: 'primitive',
    context: 'primitive',
    promiseesMap: 'primitive',
};
const defaultArgs = (values) => {
    const args = { ...DEFAULT_ARGS, ...values };
    return args;
};
const typings = (args) => {
    const out = transformPrimitiveObject(defaultArgs(args));
    return out;
};
typings.custom = (value) => ({ [CUSTOM]: value });
typings.partial = (value) => {
    const entries = Object.entries(value).filter(([key]) => key !== PARTIAL);
    const out = {};
    entries.forEach(([key, value]) => {
        out[key] = value;
    });
    return out;
};

exports.CUSTOM = CUSTOM;
exports.PARTIAL = PARTIAL;
exports.typings = typings;
//# sourceMappingURL=typings.cjs.map
