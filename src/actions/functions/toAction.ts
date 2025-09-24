import type { ActionConfig, ActionMap, ActionResult } from '#actions';
import type { PrimitiveObject } from '#bemedev/globals/types';
import type { EventsMap, PromiseeMap } from '#events';
import { reduceFnMap } from '#utils';
import { isDescriber, type FnR } from '~types';

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
) => FnR<E, P, Pc, Tc, ActionResult<Pc, Tc>> | undefined;

/**
 * Converts an ActionConfig to a function that can be executed with the provided eventsMap and promisees.
 * @param events of type {@linkcode EventsMap}, events map to use for resolving the action.
 * @param promisees of type {@linkcode PromiseeMap}, the promisees map to use for resolving the action.
 * @param action of type {@linkcode ActionConfig}, action configuration to convert.
 * @param actions of type {@linkcode ActionMap}, The actions map containing functions to execute.
 *
 * @see {@linkcode types.PrimitiveObject}
 * @see {@linkcode ActionResult}
 * @see {@linkcode reduceFnMap}
 * @see {@linkcode isDescriber}
 */
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
