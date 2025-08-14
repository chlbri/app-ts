'use strict';

require('../../constants/errors.cjs');
var constants_objects = require('../../constants/objects.cjs');
var primitives = require('../../types/primitives.cjs');
require('@bemedev/decompose');
require('fast-deep-equal');
require('../../utils/environment.cjs');
require('../../utils/merge.cjs');
var utils_reduceFnMap = require('../../utils/reduceFnMap.cjs');
require('../../utils/typings.cjs');
var recursive = require('@bemedev/boolean-recursive');
var types = require('@bemedev/types');

const _toPredicate = (events, promisees, guard, predicates) => {
    const errors = [];
    if (primitives.isDescriber(guard)) {
        const fn = predicates?.[guard.name];
        const func = fn ? utils_reduceFnMap.reduceFnMap(events, promisees, fn) : undefined;
        if (!func)
            errors.push(`Predicate (${guard.name}) is not defined`);
        return { func, errors };
    }
    if (primitives.isString(guard)) {
        const fn = predicates?.[guard];
        const func = fn ? utils_reduceFnMap.reduceFnMap(events, promisees, fn) : undefined;
        if (!func)
            errors.push(`Predicate (${guard}) is not defined`);
        return { func, errors };
    }
    const makeArray = (guards) => {
        return guards
            .map(guard => _toPredicate(events, promisees, guard, predicates))
            .filter(({ errors: errors1 }) => {
            const check = errors1.length > 0;
            if (check) {
                errors.push(...errors1);
                // Because if it has error, the function is not defined
                return false;
            }
            return true;
        })
            .map(({ func }) => func)
            .filter(types.castings.commons.isDefined);
    };
    if (constants_objects.GUARD_TYPE.and in guard) {
        const and = makeArray(guard.and);
        const check = and.length < 1;
        if (check)
            return { errors };
        return { func: { and }, errors };
    }
    const or = makeArray(guard.or);
    const check = or.length < 1;
    if (check)
        return { errors };
    return { func: { or }, errors };
};
/**
 *
 * @param events of type {@linkcode EventsMap} [E], the events map to use for resolving the predicate.
 * @param promisees of type {@linkcode PromiseeMap} [P], the promisees map to use for resolving the predicate.
 * @param guard of type {@linkcode GuardConfig}, the guard configuration to convert to a predicate.
 * @param predicates of type {@linkcode PredicateMap}, the map of predicates containing functions to execute.
 * @returns an object containing the predicate function and any errors encountered during the conversion.
 *
 * @see {@linkcode ToEvents}
 * @see {@linkcode types.PrimitiveObject}
 * @see {@linkcode PredicateS2}
 * @see {@linkcode GuardDefUnion}
 * @see {@linkcode reduceFnMap}
 * @see {@linkcode isDescriber}
 * @see {@linkcode isString}
 * @see {@linkcode castings}
 * @see {@linkcode GUARD_TYPE}
 * @see {@linkcode recursive}
 */
const toPredicate = (events, promisees, guard, predicates) => {
    const { func, errors } = _toPredicate(events, promisees, guard, predicates);
    if (!func)
        return { errors };
    return { predicate: recursive(func), errors };
};

exports.toPredicate = toPredicate;
//# sourceMappingURL=toPredicate.cjs.map
