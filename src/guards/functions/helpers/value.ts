import type { EventsMap, ToEvents } from '~events';
import { getByKey } from '~machines';
import type { PrimitiveObject } from '~types';
import type { DefinedValue } from '../../types';

export type IsValueS_F = <
  E extends EventsMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
>(
  path: DefinedValue<E, Pc, Tc>,
  ...values: any[]
) => (pContext: Pc, context: Tc, eventsMap: ToEvents<E>) => boolean;

export const isValue: IsValueS_F = (path, ...values) => {
  const start = path.startsWith.bind(path);

  return (pContext, context, event) => {
    if (start('context.')) {
      const key = path.replace('context.', '');
      return values.some(value => getByKey(context, key) === value);
    }

    if (start('pContext.')) {
      const key = path.replace('pContext.', '');
      return values.some(value => getByKey(pContext, key) === value);
    }

    const key = path.replace('events.', '');
    const check1 = typeof event === 'object';

    if (check1) {
      const toValidate = getByKey(event, key);
      return values.some(value => toValidate === value);
    }

    return false;
  };
};

export const isNotValue: IsValueS_F = (path, ...values) => {
  const func = isValue(path, ...values);

  return (pContext, context, event) => {
    const result = func(pContext, context, event);
    return !result;
  };
};
