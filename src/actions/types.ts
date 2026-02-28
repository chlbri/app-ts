import type { DeepPartial, PrimitiveObject } from '#bemedev/globals/types';
import type { EventsMap, ActorsConfigMap } from '#events';
import type { Config } from 'src/machine/types';
import type { FnMap, FnR } from 'src/types/primitives';
import type { Describer, FromDescriber } from '~types';

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
export type FromActionConfig<T> = T extends Describer
  ? FromDescriber<T>
  : T;

export type Action<
  C extends Config = Config,
  E extends EventsMap = EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = FnMap<C, E, A, Pc, Tc, ActionResult<Pc, Tc>>;

/**
 * Represents a collection of actions, where each action is identified by a string key.
 *
 * @template : type {@linkcode EventsMap}  [E], the events Map.
 * @template : type {@linkcode ActorsConfigMap} [A], the actors configuration map.
 * @template : [Pc], the type of the private context.
 * @template : type {@linkcode PrimitiveObject} [Tc], the type of the context.
 * @returns a partial record where each key is a string and each value is an {@linkcode Action}.
 */
export type ActionMap<
  C extends Config = Config,
  E extends EventsMap = EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = Partial<Record<string, Action<C, E, A, Pc, Tc>>>;

export type ActionResultFn<
  C extends Config = Config,
  E extends EventsMap = EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = FnR<C, E, A, Pc, Tc, ActionResult<Pc, Tc>>;

/**
 * Represents the result of executing an action, which includes the private context and the context.
 *
 * @template : [Pc] : The type of the private context.
 * @template : type {@linkcode PrimitiveObject} [Tc] : The type of the context.
 * @returns a {@linkcode DeepPartial} object containing the private context and the {@linkcode PrimitiveObject} context.
 */
export type ActionResult<
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = DeepPartial<{
  pContext: Pc;
  context: Tc;
}>;

export type Action2<
  C extends Config = Config,
  E extends EventsMap = EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = ActionResultFn<C, E, A, Pc, Tc>;
