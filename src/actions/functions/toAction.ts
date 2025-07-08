import type { Fn, PrimitiveObject } from '@bemedev/types/lib/types/types';
import type { ActionConfig, ActionMap, ActionResult } from '~actions';
import type { EventsMap, PromiseeMap, ToEvents } from '~events';
import { isDescriber } from '~types';
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

/**
 * Converts an ActionConfig to a function that can be executed with the provided eventsMap and promisees.
 * @param events of type {@linkcode EventsMap}, events map to use for resolving the action.
 * @param promisees of type {@linkcode PromiseeMap}, the promisees map to use for resolving the action.
 * @param action of type {@linkcode ActionConfig}, action configuration to convert.
 * @param actions of type {@linkcode ActionMap}, The actions map containing functions to execute.
 * @returns a {@linkcode Fn} function that executes the action or undefined if not found.
 *
 * @see {@linkcode ToEvents}
 * @see {@linkcode PrimitiveObject}
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
