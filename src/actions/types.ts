import type { DeepPartial, Fn } from '@bemedev/types';
import type { EventsMap, PromiseeMap, ToEvents } from '~events';
import type {
  Describer,
  FnMap,
  FromDescriber,
  PrimitiveObject,
} from '~types';

/**
 * JSON configuration for an action.
 */
export type ActionConfig = string | Describer;

/**
 * Retrieves the name of the action if it is a describer, otherwise returns the action itself.
 * @template T ActionConfig to reduce
 * @returns The name of the action if it is a describer, otherwise the action itself.
 */
export type FromActionConfig<T extends ActionConfig> = T extends Describer
  ? FromDescriber<T>
  : T;

/**
 * Represents an action function that can be executed with the provided context and events.
 * It takes in a context object and an events map, and returns an ActionResult.
 *
 * @template : type {@linkcode EventsMap}  [E], the events Map.
 * @template : type {@linkcode PromiseeMap} [P], the promisees map.
 * @template : [Pc] : The type of the private context.
 * @template : type {@linkcode PrimitiveObject} [Tc] : The type of the context.
 * @returns : An {@linkcode FnMap}
 */
export type Action<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = FnMap<E, P, Pc, Tc, ActionResult<Pc, Tc>>;

/**
 * Represents a collection of actions, where each action is identified by a string key.
 *
 * @template : type {@linkcode EventsMap}  [E], the events Map.
 * @template : type {@linkcode PromiseeMap} [P], the promisees map.
 * @template : [Pc] : The type of the private context.
 * @template : type {@linkcode PrimitiveObject} [Tc] : The type of the context.
 * @returns : A partial record where each key is a string and each value is an {@linkcode Action}.
 */
export type ActionMap<
  E extends EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = Partial<Record<string, Action<E, P, Pc, Tc>>>;

/**
 * Represents the result of executing an action, which includes the private context and the context.
 *
 * @template : [Pc] : The type of the private context.
 * @template : type {@linkcode PrimitiveObject} [Tc] : The type of the context.
 * @returns : A deep partial object containing the private context and the context.
 */
export type ActionResult<
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = DeepPartial<{
  pContext: Pc;
  context: Tc;
}>;

export type Action2<
  E extends EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = Fn<[Pc, Tc, ToEvents<E, P>], ActionResult<Pc, Tc>>;
