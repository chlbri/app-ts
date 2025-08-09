import { toTransition } from '../../transitions/functions/toTransition.js';
import { toArray } from '@bemedev/basifun';
import { toPromiseSrc } from './src.js';

/**
 * Converts a promise config to a promisee object with a source and transitions.
 * @param events of type {@linkcode EventsMap}, the events map.
 * @param promisees of type {@linkcode PromiseeMap}, the promisees map.
 * @param promise of type {@linkcode PromiseeConfig}, the promise configuration to convert.
 * @param options of type {@linkcode SimpleMachineOptions}, the machine options.
 * @returns a promisee object with a source and transitions.
 *
 * @see {@linkcode toPromiseSrc} for converting the source.
 * @see {@linkcode toTransition} for converting transitions.
 * @see {@linkcode toArray.typed} for the type of the context.
 * @see {@linkcode ToPromise_F} formore details
 */
const toPromise = (events, promisees, promise, options) => {
    const src = toPromiseSrc(events, promisees, promise.src, options?.promises);
    const then = toArray
        .typed(promise.then)
        .map(config => toTransition(events, promisees, config, options));
    const _catch = toArray
        .typed(promise.catch)
        .map(config => toTransition(events, promisees, config, options));
    const _finally = toArray.typed(promise.finally).map(config => {
        const check1 = typeof config === 'object' && 'actions' in config;
        if (check1)
            return toTransition(events, promisees, config, options);
        return toTransition(events, promisees, { actions: config }, options);
    });
    const out = { src, then, catch: _catch, finally: _finally };
    const { description } = promise;
    if (description)
        out.description = description;
    return out;
};

export { toPromise };
//# sourceMappingURL=toPromise.js.map
