import type { PrimitiveObject } from '#bemedev/globals/types';
import type {
  ActorsConfigMap,
  EventsMap,
  ToEventObject,
  ToEvents2,
} from '#events';
import { reduceFnMap } from '#utils';
import type {
  Action2,
  ActionConfig,
  ActionMap,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ActionResult,
} from 'src/actions/types';
import { fromDescriber, isDescriber } from '~types';

export type ToAction_F = <
  E extends EventsMap = EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
  Eo extends ToEventObject<ToEvents2<E, A>> = ToEventObject<
    ToEvents2<E, A>
  >,
>(
  events: E,
  actorsMap: A,
  action: ActionConfig,
  actions?: ActionMap<Eo, Pc, Tc, T>,
) => Action2<Eo, Pc, Tc, T> | undefined;

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
  const name = fromDescriber(action);
  const fn = actions?.[name];
  const func = fn ? reduceFnMap(events, actorsMap, fn) : undefined;
  return func;
};
