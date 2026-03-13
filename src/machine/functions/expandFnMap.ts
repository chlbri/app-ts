import type { Action2 } from '#actions';
import type { Cast, PrimitiveObject } from '#bemedev/globals/types';
import type {
  ActorsConfigMap,
  EventsMap,
  ToEventObject,
  ToEvents,
} from '#events';
import { reduceFnMap } from '#utils';
import type { Decompose } from '@bemedev/decompose';
import { type FnMap } from '~types';
import { assignByKey } from './subcriber';

export type ExpandFnMap = <
  Pc,
  Tc = PrimitiveObject,
  D = Decompose<
    {
      pContext: Pc;
      context: Tc;
    },
    { sep: '.'; object: 'both'; start: false }
  >,
  K extends Extract<keyof D, string> = Extract<keyof D, string>,
  R = D[K],
  E extends EventsMap = EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  T extends string = string,
  Eo extends ToEventObject<ToEvents<E, A>> = ToEventObject<ToEvents<E, A>>,
>(
  events: E,
  actorsMap: A,
  key: K,
  fn: FnMap<Eo, Pc, Cast<Tc, PrimitiveObject>, T, R>,
) => Action2<Eo, Pc, Cast<Tc, PrimitiveObject>, T>;
/**
 *
 * @param events : type {@linkcode EventsMap} [E] - The events map.
 * @param promisees  : type {@linkcode ActorsConfigMap} [P] - The promisees map.
 * @param key  : type {@linkcode Decompose} [D] - The key to assign the result to in the context and the private context.
 * @param fn  : type {@linkcode FnMap} [E, P, Pc, Tc, R] - The function to reduce the events and promisees and performs the action.
 * @returns a {@linkcode Action2} function.
 *
 * @see {@linkcode assignByKey} for assigning the result to the context and private context.
 * @see {@linkcode reduceFnMap} for reducing the events and promisees.
 * @see {@linkcode Decompose} for decomposing the private context and context into paths.
 *
 */
export const expandFnMap: ExpandFnMap = (events, promisees, key, fn) => {
  const _fn = reduceFnMap(events, promisees, fn);

  return ({ pContext, context, ...rest }) => {
    const all = {
      pContext,
      context,
    };
    const result = _fn({ pContext, context, ...rest });
    return assignByKey(all, key, result);
  };
};
