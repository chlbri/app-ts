'use strict';

var types = require('@bemedev/types');
var types_primitives = require('../types/primitives.cjs');
var utils_nothing = require('./nothing.cjs');

const toEventsMap = (events, _promisees) => {
    const promisees = Object.entries(_promisees).reduce((acc, [key, value]) => {
        acc[`${key}::then`] = value.then;
        acc[`${key}::catch`] = value.catch;
        return acc;
    }, {});
    return { ...events, ...promisees };
};
/**
 * Reduces a function map to a single function that processes events.
 * @param events the events map.
 * @param promisees the promisees map.
 * @param fn the function map to reduce.
 * @returns a function that takes a context and an event, returning the result of the function map.
 *
 * @see {@linkcode ReduceFnMap_F} for the type definition.
 * @see {@linkcode toEventsMap} for converting events and promisees to a map.
 * @see {@linkcode isFunction} for checking if a value is a function.
 * @see {@linkcode nothing} for the default else function.
 */
const reduceFnMap = (events, promisees, fn) => {
    const check1 = types_primitives.isFunction(fn);
    if (check1)
        return fn;
    const map = toEventsMap(events, promisees);
    const keys = Object.keys(map);
    return ({ event, context, pContext, status, value, tags }) => {
        const check5 = typeof event === 'string';
        const _else = fn.else ?? utils_nothing.nothing;
        if (check5)
            return types.castings.commons.any(_else({ event, context, pContext, status, value, tags }));
        const { payload, type } = event;
        for (const key of keys) {
            const check2 = type === key;
            const func = types.castings.commons.any(fn)[key];
            const check3 = !!func;
            const check4 = check2 && check3;
            if (check4)
                return func({ payload, context, pContext, status, value, tags });
        }
        return types.castings.commons.any(_else({ event, context, pContext, status, value, tags }));
    };
};
/**
 * Reduces a function map to a single function that processes events with a context.
 * @param events the events map.
 * @param promisees the promisees map.
 * @param fn the function map to reduce.
 * @returns a function that takes a context and an event, returning the result of the function map.
 *
 * @see {@linkcode ReduceFnMap2_F} for the type definition.
 * @see {@linkcode toEventsMap} for converting events and promisees to a map.
 * @see {@linkcode isFunction} for checking if a value is a function.
 * @see {@linkcode nothing} for the default else function.
 *
 * @remarks
 * This version is specifically designed to work with a context and an events map,
 *
 * Similar to {@linkcode reduceFnMap}, but it does not take a private context.
 */
const reduceFnMapReduced = (events, promisees, fn) => {
    const check1 = types_primitives.isFunction(fn);
    if (check1)
        return types.castings.commons.any(fn);
    const map = toEventsMap(events, promisees);
    const keys = Object.keys(map);
    return ({ context, event, status, value, tags }) => {
        const check5 = typeof event === 'string';
        const _else = fn.else ?? utils_nothing.nothing;
        if (check5)
            return types.castings.commons.any(_else({ context, event, status, value, tags }));
        const { payload, type } = event;
        for (const key of keys) {
            const check2 = type === key;
            const func = types.castings.commons.any(fn)[key];
            const check3 = !!func;
            const check4 = check2 && check3;
            if (check4)
                return func({ context, payload, status, value, tags });
        }
        return types.castings.commons.any(_else({ context, event, status, value, tags }));
    };
};

exports.reduceFnMap = reduceFnMap;
exports.reduceFnMapReduced = reduceFnMapReduced;
exports.toEventsMap = toEventsMap;
//# sourceMappingURL=reduceFnMap.cjs.map
