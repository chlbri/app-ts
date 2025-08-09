import '@bemedev/decompose';
import 'fast-deep-equal';
import '../../utils/environment.js';
import '../../utils/merge.js';
import '../../constants/errors.js';
import { reduceFnMap } from '../../utils/reduceFnMap.js';
import '../../utils/typings.js';

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
    const func = fn ? reduceFnMap(events, promisees, fn) : undefined;
    return func;
};

export { toPromiseSrc };
//# sourceMappingURL=src.js.map
