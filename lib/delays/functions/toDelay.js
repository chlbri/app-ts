import '@bemedev/decompose';
import 'fast-deep-equal';
import '../../utils/environment.js';
import '../../utils/merge.js';
import '../../constants/errors.js';
import { reduceFnMap } from '../../utils/reduceFnMap.js';
import '../../utils/typings.js';

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
    const func = fn ? reduceFnMap(events, promisees, fn) : undefined;
    return func;
};

export { toDelay };
//# sourceMappingURL=toDelay.js.map
