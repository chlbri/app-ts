import type {
  ActionConfig,
  ActionMap,
  ActionResult,
} from 'src/actions/types2';
import type { PrimitiveObject } from '#bemedev/globals/types';
import type { ActorsConfigMap, EventsMap } from '#events';
import { reduceFnMap } from '#utils';
import type { FnR } from 'src/types/primitives2';
import { isDescriber } from '~types';

export type ToAction_F = <
  E extends EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
>(
  events: E,
  actorsMap: A,
  action: ActionConfig,
  actions?: ActionMap<E, A, Pc, Tc>,
) => FnR<E, A, Pc, Tc, ActionResult<Pc, Tc>> | undefined;

/**
 * Converts an ActionConfig to a function that can be executed with the provided eventsMap and promisees.
 * @param events of type {@linkcode EventsMap}, events map to use for resolving the action.
 * @param promisees of type {@linkcode PromiseeMap}, the promisees map to use for resolving the action.
 * @param action of type {@linkcode ActionConfig}, action configuration to convert.
 * @param actions of type {@linkcode ActionMap}, The actions map containing functions to execute.
 *
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
