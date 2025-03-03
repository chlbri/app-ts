import type { Fn } from '@bemedev/types';
import type { ActionConfig, ActionMap, ActionResult } from '~actions';
import type { EventsMap, PromiseeMap, ToEvents } from '~events';
import { isDescriber, type PrimitiveObject } from '~types';
import { reduceFnMap } from '~utils';

export type ToAction_F = <
  E extends EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
>(
  events: E,
  promisees: P,
  action: ActionConfig,
  actions?: ActionMap<E, P, Pc, Tc>,
) => Fn<[Pc, Tc, ToEvents<E, P>], ActionResult<Pc, Tc>> | undefined;

export const toAction: ToAction_F = (
  events,
  promisees,
  action,
  actions,
) => {
  if (isDescriber(action)) {
    const fn = actions?.[action.name];
    const func = fn ? reduceFnMap(events, promisees, fn) : undefined;
    return func;
  }

  const fn = actions?.[action];
  const func = fn ? reduceFnMap(events, promisees, fn) : undefined;
  return func;
};
