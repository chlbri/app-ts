import '@bemedev/decompose';
import 'fast-deep-equal';
import '../../utils/environment.js';
import '../../utils/merge.js';
import '../../constants/errors.js';
import { castings } from '@bemedev/types';
import '../../utils/typings.js';
import { toAction } from '../../actions/functions/toAction.js';
import { toPromise } from '../../promises/functions/toPromise.js';
import { toTransition } from '../../transitions/functions/toTransition.js';
import { toArray } from '@bemedev/basifun';
import { identify } from '@bemedev/basifun/objects/identify';
import { stateType } from './stateType.js';

/**
 * Resolves a node configuration into a full node with all functions.
 *
 * @param events - The events map used for action and transition resolution.
 * @param promisees - The promisees map used for promise resolution.
 * @param config - The node configuration to resolve.
 * @param options - Optional machine options that may include actions and promises configurations.
 * @returns A structured representation of the node with its properties and transitions.
 *
 * @see {@linkcode ResolveNode_F} for more details
 * @see {@linkcode toAction} for converting actions
 * @see {@linkcode toTransition} for converting transitions
 * @see {@linkcode toPromise} for converting promises
 * @see {@linkcode toArray.typed} for ensuring typed arrays
 * @see {@linkcode stateType} for determining the type of the state
 * @see {@linkcode identify} for identifying properties in the configuration
 *
 */
const resolveNode = (events, promisees, config, options) => {
    // #region functions for mapping
    const aMapper = (action) => {
        return toAction(events, promisees, action, options?.actions);
    };
    const tMapper = (config) => {
        return toTransition(events, promisees, config, options);
    };
    // #endregion
    const { description, initial, tags: _tags } = config;
    const __id = config.__id;
    const type = stateType(config);
    const tags = toArray.typed(_tags);
    const entry = toArray.typed(config.entry).map(aMapper);
    const exit = toArray.typed(config.exit).map(aMapper);
    const states = identify(config.states).map(config => resolveNode(events, promisees, config, options));
    const on = identify(config.on).map(tMapper);
    const always = toArray.typed(config.always).map(tMapper);
    const after = identify(config.after).map(tMapper);
    const promises = toArray
        .typed(config.promises)
        .map(promise => toPromise(events, promisees, promise, options));
    const out = castings.commons.any({
        type,
        entry,
        exit,
        tags,
        states,
        on,
        always,
        after,
        promises,
    });
    if (__id)
        out.__id = __id;
    if (initial)
        out.initial = initial;
    if (description)
        out.description = description;
    return out;
};

export { resolveNode };
//# sourceMappingURL=resolveNode.js.map
