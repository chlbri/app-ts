import { t } from '@bemedev/types';
import type { EventsMap, PromiseeMap, ToEvents } from '~events';
import { getByKey } from '~machines';
import type { PrimitiveObject } from '~types';
import type { DefinedValue } from '../../types';

export type IsValueS_F = <
  E extends EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
>(
  path: DefinedValue<Pc, Tc>,
  ...values: any[]
) => (pContext: Pc, context: Tc, eventsMap: ToEvents<E, P>) => boolean;

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

export const isNotValue: IsValueS_F = (path, ...values) => {
  const func = isValue(path, ...values);

  return (pContext, context, event) => {
    const result = func(pContext, context, t.any(event));
    return !result;
  };
};
