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

/**
 * Converts an ActionConfig to a function that can be executed with the provided eventsMap and promisees.
 * @param events - The events map to use for resolving the action.
 * @param promisees - The promisees map to use for resolving the action.
 * @param action - The action configuration to convert.
 * @param actions - The actions map containing functions to execute.
 * @returns A function that executes the action or undefined if not found.
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
