const action = {
    normal: 'action',
    capital: 'Action',
};
const guard = {
    normal: 'guard',
    capital: 'Guard',
};
const delay = {
    normal: 'delay',
    capital: 'Delay',
};
const promise = {
    normal: 'promise',
    capital: 'Promise',
};
const machine = {
    normal: 'machine',
    capital: 'Machine',
};
const notDefined = 'is undefined';
const notDescribed = 'is not described';
const notProvided = 'is not provided';
const notDefinedF = (type) => {
    const string = `${type} ${notDefined}`;
    return { string, error: new Error(string) };
};
const notDescribedF = (type) => {
    const string = `${type} ${notDescribed}`;
    return { string, error: new Error(string) };
};
const notProvidedF = (type) => {
    const string = `${type} ${notProvided}`;
    return { string, error: new Error(string) };
};
const produceErrors = (...types) => {
    const out = {};
    types.forEach(value => {
        Object.assign(out, {
            [value.normal]: {
                notDefined: notDefinedF(value['capital']),
                notDescribed: notDescribedF(value['capital']),
                notProvided: notProvidedF(value['capital']),
            },
        });
    });
    return out;
};
/**
 * Contains error messages for various machine components.
 * Each component (action, guard, delay, promise, machine) has three types of errors:
 * - `notDefined`: Indicates that the component is not defined.
 * - `notDescribed`: Indicates that the component is not described.
 * - `notProvided`: Indicates that the component is not provided.
 */
const ERRORS = produceErrors(action, guard, delay, promise, machine);

export { ERRORS };
//# sourceMappingURL=errors.js.map
