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
  return (pContext, context, event) => {
    const checkContext = path.startsWith('context.');
    if (checkContext) {
      const key = path.replace('context.', '');
      return values.some(value => getByKey(context, key) === value);
    }

    const checkPContext = path.startsWith('pContext.');
    if (checkPContext) {
      const key = path.replace('pContext.', '');
      return values.some(value => getByKey(pContext, key) === value);
    }

    const checkEvent = path.startsWith('events.');
    if (checkEvent) {
      const key = path.replace('events.', '');
      const check1 = typeof event === 'object';

      if (check1) {
        const toValidate = getByKey(event, key);
        return values.some(value => toValidate === value);
      }

      return false;
    }

    throw new Error('Invalid path');
  };
};

export const isNotValue: IsValueS_F = (path, ...values) => {
  return (pContext, context, event) => {
    const checkContext = path.startsWith('context.');
    if (checkContext) {
      const key = path.replace('context.', '');
      return values.every(value => getByKey(context, key) !== value);
    }

    const checkPContext = path.startsWith('pContext.');
    if (checkPContext) {
      const key = path.replace('pContext.', '');
      return values.every(value => getByKey(pContext, key) !== value);
    }

    const checkEvent = path.startsWith('events.');
    if (checkEvent) {
      const key = path.replace('events.', '');
      const check1 = typeof event === 'object';

      if (check1) {
        const toValidate = getByKey(event, key);
        return values.every(value => toValidate !== value);
      }

      return false;
    }

    throw new Error('Invalid path');
  };
};
