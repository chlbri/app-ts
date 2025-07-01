import { t } from '@bemedev/types';
import type { EventsMap, PromiseeMap } from '~events';
import { getByKey } from '~machines';
import type { FnR, PrimitiveObject } from '~types';
import type { DefinedValue } from '../../types';

export type IsValueS_F = <
  E extends EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
>(
  path: DefinedValue<Pc, Tc>,
  ...values: any[]
) => FnR<E, P, Pc, Tc, boolean>;

/**
 * Checks if the value at the specified path in pContext, context, or events matches any of the provided values.
 * @param path of type {@linkcode DefinedValue}, the path to retrieve.
 * @enum
 * The path can be one of the following:
 * - 'pContext': checks if the value in pContext is one of the provided values
 * - 'context': checks if the value in context is one of the provided values
 * - 'events': checks if the value in events is one of the provided values
 * - 'context.[key]': checks if the value in context at the specified key is one of the provided values
 * - 'pContext.[key]': checks if the value in pContext at the specified key is one of the provided values
 * - 'events.[key]': checks if the value in events at the specified key is one of the provided values
 * @param values the values to check against.
 * @returns a {@linkcode FnR} function that takes pContext, context, and eventsMap and returns true if the value at the specified path matches any of the provided values, false otherwise.
 *
 * @example
 * ```ts
 * const guard = isValue('context.userId', '123', '456');
 * const result = guard({ context: { userId: '123' } }, {}, {});
 * console.log(result); // true
 * ```
 *
 * @see {@linkcode EventsMap} for the type of the events map.
 * @see {@linkcode PromiseeMap} for the type of the promisees map.
 * @see {@linkcode PrimitiveObject} for the type of the context.
 * @see {@linkcode getByKey} for retrieving values by key.
 *  @see {@linkcode t} for type checking and validation.
 *
 * @see {@linkcode isNotValue} for the opposite check.
 */
export const isValue: IsValueS_F = (path, ...values) => {
  const start = path.startsWith.bind(path);

  return (pContext, context, event) => {
    if (path === 'pContext') {
      return values.some(value => pContext === value);
    }

    if (path === 'context') {
      return values.some(value => context === value);
    }

    if (path === 'events') return values.some(value => event === value);

    if (start('context.')) {
      const key = path.replace('context.', '');
      return values.some(value => getByKey(context, key) === value);
    }

    if (start('pContext.')) {
      const key = path.replace('pContext.', '');
      return values.some(value => getByKey(pContext, key) === value);
    }

    const key = path.replace('events.', '');
    const toValidate = getByKey(event, key);
    return values.some(value => toValidate === value);
  };
};

/**
 * Checks if the value at the specified path in pContext, context, or events doesn't matches any of the provided values.
 * @param path of type {@linkcode DefinedValue}, the path to retrieve.
 * @enum
 * The path can be one of the following:
 * - 'pContext': checks if the value in pContext is one of the provided values
 * - 'context': checks if the value in context is one of the provided values
 * - 'events': checks if the value in events is one of the provided values
 * - 'context.[key]': checks if the value in context at the specified key is one of the provided values
 * - 'pContext.[key]': checks if the value in pContext at the specified key is one of the provided values
 * - 'events.[key]': checks if the value in events at the specified key is one of the provided values
 * @param values the values to check against.
 * @returns a {@linkcode FnR} function that takes pContext, context, and eventsMap and returns true if the value at the specified path matches doesn't any of the provided values, false otherwise.
 *
 * @example
 * ```ts
 * const guard = isNotValue('context.userId', '123', '456');
 * const result = guard({ context: { userId: '123' } }, {}, {});
 * console.log(result); // false
 * ```
 *
 * @see {@linkcode EventsMap} for the type of the events map.
 * @see {@linkcode PromiseeMap} for the type of the promisees map.
 * @see {@linkcode PrimitiveObject} for the type of the context.
 * @see {@linkcode getByKey} for retrieving values by key.
 * @see {@linkcode t} for type checking and validation.
 *
 * @see {@linkcode isValue} for the opposite check.
 */
export const isNotValue: IsValueS_F = (path, ...values) => {
  const func = isValue(path, ...values);

  return (pContext, context, event) => {
    const result = func(pContext, context, t.any(event));
    return !result;
  };
};
