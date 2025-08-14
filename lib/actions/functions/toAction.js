import '@bemedev/decompose';
import 'fast-deep-equal';
import '../../utils/environment.js';
import '../../utils/merge.js';
import '../../constants/errors.js';
import { reduceFnMap } from '../../utils/reduceFnMap.js';
import { isDescriber } from '../../types/primitives.js';
import '../../utils/typings.js';

/**
 * Converts an ActionConfig to a function that can be executed with the provided eventsMap and promisees.
 * @param events of type {@linkcode EventsMap}, events map to use for resolving the action.
 * @param promisees of type {@linkcode PromiseeMap}, the promisees map to use for resolving the action.
 * @param action of type {@linkcode ActionConfig}, action configuration to convert.
 * @param actions of type {@linkcode ActionMap}, The actions map containing functions to execute.
 *
 * @see {@linkcode types.PrimitiveObject}
 * @see {@linkcode ActionResult}
 * @see {@linkcode reduceFnMap}
 * @see {@linkcode isDescriber}
 */
const toAction = (events, promisees, action, actions) => {
    if (isDescriber(action)) {
        const fn = actions?.[action.name];
        const func = fn ? reduceFnMap(events, promisees, fn) : undefined;
        return func;
    }
    const fn = actions?.[action];
    const func = fn ? reduceFnMap(events, promisees, fn) : undefined;
    return func;
};

export { toAction };
//# sourceMappingURL=toAction.js.map
