import type { types } from '@bemedev/types';
import type { EventsMap, PromiseeMap } from '~events';
import type { Describer, FnMap, FnR, FromDescriber } from '~types';

/**
 * JSON configuration for an action.
 *
 * @see {@linkcode Describer} for more details.
 */
export type ActionConfig = string | Describer;

/**
 * Retrieves the name of the action if it is a describer, otherwise returns the action itself.
 * @template : type {@linkcode ActionConfig} [T], ActionConfig to reduce
 * @returns The name of the action if it is a describer, otherwise the action itself.
 *
 * @see {@linkcode FromDescriber} for more details.
 */
export type FromActionConfig<T extends ActionConfig> = T extends Describer
  ? FromDescriber<T>
  : T;

export type Action<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc extends types.PrimitiveObject = types.PrimitiveObject,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
> = FnMap<E, P, Pc, Tc, ActionResult<Pc, Tc>>;

/**
 * Represents a collection of actions, where each action is identified by a string key.
 *
 * @template : type {@linkcode EventsMap}  [E], the events Map.
 * @template : type {@linkcode PromiseeMap} [P], the promisees map.
 * @template : [Pc], the type of the private context.
 * @template : type {@linkcode types.PrimitiveObject} [Tc], the type of the context.
 * @returns a partial record where each key is a string and each value is an {@linkcode Action}.
 */
export type ActionMap<
  E extends EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc extends types.PrimitiveObject = types.PrimitiveObject,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
> = Partial<Record<string, Action<E, P, Pc, Tc>>>;

export type ActionResultFn<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc extends types.PrimitiveObject = types.PrimitiveObject,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
> = FnR<E, P, Pc, Tc, ActionResult<Pc, Tc>>;

/**
 * Represents the result of executing an action, which includes the private context and the context.
 *
 * @template : [Pc] : The type of the private context.
 * @template : type {@linkcode types.PrimitiveObject} [Tc] : The type of the context.
 * @returns a {@linkcode DeepPartial} object containing the private context and the {@linkcode types.PrimitiveObject} context.
 */
export type ActionResult<
  Pc extends types.PrimitiveObject = types.PrimitiveObject,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
> = types.DeepPartial<{
  pContext: Pc;
  context: Tc;
}>;

export type Action2<
  E extends EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc extends types.PrimitiveObject = types.PrimitiveObject,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
> = ActionResultFn<E, P, Pc, Tc>;
