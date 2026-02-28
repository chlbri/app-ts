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
import type { Config } from 'src/machine/types2';

export type ToAction_F = <
  C extends Config,
  E extends EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
>(
  events: E,
  actorsMap: A,
  action: ActionConfig,
  actions?: ActionMap<C, E, A, Pc, Tc>,
) => FnR<C, E, A, Pc, Tc, ActionResult<Pc, Tc>> | undefined;

/**
 * Converts an ActionConfig to a function that can be executed with the provided eventsMap and promisees.
 * @param events of type {@linkcode EventsMap}, events map to use for resolving the action.
 * @param actorsMap of type {@linkcode PromiseeMap}, the promisees map to use for resolving the action.
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
  actorsMap,
  action,
  actions,
) => {
  if (isDescriber(action)) {
    const fn = actions?.[action.name];
    const func = fn ? reduceFnMap(events, actorsMap, fn) : undefined;
    return func;
  }

  const fn = actions?.[action];
  const func = fn ? reduceFnMap(events, actorsMap, fn) : undefined;
  return func;
};
