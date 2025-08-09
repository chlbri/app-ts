'use strict';

var transitions_functions_toTransition = require('../../transitions/functions/toTransition.cjs');
var basifun = require('@bemedev/basifun');
var promises_functions_src = require('./src.cjs');

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
    const src = promises_functions_src.toPromiseSrc(events, promisees, promise.src, options?.promises);
    const then = basifun.toArray
        .typed(promise.then)
        .map(config => transitions_functions_toTransition.toTransition(events, promisees, config, options));
    const _catch = basifun.toArray
        .typed(promise.catch)
        .map(config => transitions_functions_toTransition.toTransition(events, promisees, config, options));
    const _finally = basifun.toArray.typed(promise.finally).map(config => {
        const check1 = typeof config === 'object' && 'actions' in config;
        if (check1)
            return transitions_functions_toTransition.toTransition(events, promisees, config, options);
        return transitions_functions_toTransition.toTransition(events, promisees, { actions: config }, options);
    });
    const out = { src, then, catch: _catch, finally: _finally };
    const { description } = promise;
    if (description)
        out.description = description;
    return out;
};

exports.toPromise = toPromise;
//# sourceMappingURL=toPromise.cjs.map
