'use strict';

require('@bemedev/decompose');
require('fast-deep-equal');
require('../../utils/environment.cjs');
require('../../utils/merge.cjs');
require('../../constants/errors.cjs');
var utils_reduceFnMap = require('../../utils/reduceFnMap.cjs');
require('../../utils/typings.cjs');

/**
 * Converts a source string to a function that can be used to retrieve the promise.
 * @param events of type {@linkcode EventsMap}, the events map.
 * @param promisees of type {@linkcode PromiseeMap}, the promisees map.
 * @param src of type string, the source string to convert.
 * @param promises of type {@linkcode SimpleMachineOptions}, the machine options containing promises.
 * @returns a function that retrieves the promise or undefined if not found.
 *
 * @see {@linkcode reduceFnMap} for reducing the function map.
 * @see {@linkcode PromiseFunction2} for more details
 */
const toPromiseSrc = (events, promisees, src, promises) => {
    const fn = promises?.[src];
    const func = fn ? utils_reduceFnMap.reduceFnMap(events, promisees, fn) : undefined;
    return func;
};

exports.toPromiseSrc = toPromiseSrc;
//# sourceMappingURL=src.cjs.map
