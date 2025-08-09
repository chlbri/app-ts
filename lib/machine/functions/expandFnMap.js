import '@bemedev/decompose';
import 'fast-deep-equal';
import '../../utils/environment.js';
import '../../utils/merge.js';
import '../../constants/errors.js';
import { reduceFnMap } from '../../utils/reduceFnMap.js';
import '../../utils/typings.js';
import { assignByKey } from './subcriber/contexts.js';
import '@bemedev/basifun';

/**
 *
 * @param events : type {@linkcode EventsMap} [E] - The events map.
 * @param promisees  : type {@linkcode PromiseeMap} [P] - The promisees map.
 * @param key  : type {@linkcode Decompose} [D] - The key to assign the result to in the context and the private context.
 * @param fn  : type {@linkcode FnMap} [E, P, Pc, Tc, R] - The function to reduce the events and promisees and performs the action.
 * @returns a {@linkcode ActionResultFn} function.
 *
 * @see {@linkcode assignByKey} for assigning the result to the context and private context.
 * @see {@linkcode reduceFnMap} for reducing the events and promisees.
 * @see {@linkcode Decompose} for decomposing the private context and context into paths.
 *
 */
const expandFnMap = (events, promisees, key, fn) => {
    const _fn = reduceFnMap(events, promisees, fn);
    return ({ pContext, context, ...rest }) => {
        const all = {
            pContext,
            context,
        };
        const result = _fn({ pContext, context, ...rest });
        return assignByKey(all, key, result);
    };
};

export { expandFnMap };
//# sourceMappingURL=expandFnMap.js.map
