'use strict';

require('@bemedev/decompose');
require('fast-deep-equal');
require('../../utils/environment.cjs');
require('../../utils/merge.cjs');
require('../../constants/errors.cjs');
var utils_reduceFnMap = require('../../utils/reduceFnMap.cjs');
require('../../utils/typings.cjs');

/**
 * Converts a delay configuration to a function that returns the delay in milliseconds.
 * If the delay is a number, it returns a function that returns that number.
 * If the delay is a function, it reduces the function map with the provided events and promisees.
 *
 * @param events of type {@linkcode EventsMap} [E], the events map to use for resolving the delay.
 * @param promisees of type {@linkcode PromiseeMap} [P], the promisees map to use for resolving the delay.
 * @param delay of type string,  The delay configuration.
 * @param delays of type {@linkcode DelayMap}, the map of delays containing functions to execute.
 * @returns a function that returns the delay in milliseconds or undefined if not found.
 *
 * @see {@linkcode types.PrimitiveObject}
 * @see {@linkcode reduceFnMap}
 */
const toDelay = (events, promisees, delay, delays) => {
    const fn = delays?.[delay];
    const check = typeof fn === 'number';
    if (check)
        return () => fn;
    const func = fn ? utils_reduceFnMap.reduceFnMap(events, promisees, fn) : undefined;
    return func;
};

exports.toDelay = toDelay;
//# sourceMappingURL=toDelay.cjs.map
