import { isDefined } from '@bemedev/basifun';
import type { Fn } from '@bemedev/types';
import type { ActionConfig, ActionMap, ActionResult } from '~actions';
import type { EventsMap, ToEvents } from '~events';
import { isDescriber, type PrimitiveObject } from '~types';
import { reduceFnMap } from '~utils';

export type ToAction_F = <
  E extends EventsMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
>(
  events: E,
  action?: ActionConfig,
  actions?: ActionMap<E, Pc, Tc>,
) => Fn<[Pc, Tc, ToEvents<E>], ActionResult<Pc, Tc>> | undefined;

export const toAction: ToAction_F = (events, action, actions) => {
  if (!isDefined(action)) return undefined;

  if (isDescriber(action)) {
    const fn = actions?.[action.name];
    const func = fn ? reduceFnMap(events, fn) : undefined;
    return func;
  }

  const fn = actions?.[action];

  const func = fn ? reduceFnMap(events, fn) : undefined;

  return func;
};
