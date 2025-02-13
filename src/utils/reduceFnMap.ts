import type { EventsMap, ToEvents } from '~events';
import { isFunction, type FnMap, type PrimitiveObject } from '~types';

export type ReduceFnMap_F = <
  const E extends EventsMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  R = any,
>(
  events: E,
  fn: FnMap<E, Pc, Tc, R>,
) => (pContext: Pc, context: Tc, eventsMap: ToEvents<E>) => R;

export const reduceFnMap: ReduceFnMap_F = (events, fn) => {
  const check1 = isFunction(fn);
  if (check1) return fn;

  const keys = Object.keys(events);

  return (pContext, context, event) => {
    const check5 = typeof event === 'string';
    if (check5) return;

    const { payload, type } = event;
    const _else = fn.else!;

    for (const key of keys) {
      const check2 = type === key;
      const func = fn[key];
      const check3 = !!func;

      const check4 = check2 && check3;
      if (check4) return func(pContext, context, payload);
    }

    return _else(pContext, context, event) as any;
  };
};
