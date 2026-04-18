import type { DeepPartial, PrimitiveObject } from '#bemedev/globals/types';
import type { EventObject } from '#events';
import type { FnMap, FnR } from '~types';
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

/**
 * An action may return synchronously or asynchronously.
 *
 * Any action (user-provided or produced by an `addOptions` helper except
 * `debounce`) may return `ActionResult` or a promise that resolves to one.
 */
export type MaybeAsyncActionResult<
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = ActionResult<Pc, Tc> | Promise<ActionResult<Pc, Tc>>;

export type Action<
  E extends EventObject = EventObject,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
> = FnMap<E, Pc, Tc, T, MaybeAsyncActionResult<Pc, Tc>>;

/**
 * Represents a collection of actions, where each action is identified by a string key.
 *
 * @template : type {@linkcode EventObject}  [E], all events.
 * @template : [Pc], the type of the private context.
 * @template : type {@linkcode PrimitiveObject} [Tc], the type of the context.
 * @returns a partial record where each key is a string and each value is an {@linkcode Action}.
 */
export type ActionMap<
  E extends EventObject = EventObject,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
> = Partial<Record<string, Action<E, Pc, Tc, T>>>;

export type Action2<
  E extends EventObject = EventObject,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
> = FnR<E, Pc, Tc, T, MaybeAsyncActionResult<Pc, Tc>>;

export type Action22<
  E extends EventObject = EventObject,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
> = FnR<E, Pc, Tc, T, ActionResult<Pc, Tc>>;
