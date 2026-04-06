import { toAction } from '#actions';
import type { PrimitiveObject } from '#bemedev/globals/types';
import type {
  ActorsConfigMap,
  EventsMap,
  ToEventObject,
  ToEvents,
} from '#events';
import { toPredicate, type GuardConfig } from '#guards';
import type { SimpleMachineOptions } from '#machines';
import type { Transition, TransitionConfig } from '#transitions';
import toArray from '#bemedev/features/arrays/castings/toArray';

export type ToTransition_F = <
  E extends EventsMap = EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
  Eo extends ToEventObject<ToEvents<E, A>> = ToEventObject<ToEvents<E, A>>,
>(
  events: E,
  actorsMap: A,
  config: TransitionConfig,
  options?: Pick<
    SimpleMachineOptions<E, A, Pc, Tc, T, Eo>,
    'actions' | 'predicates'
  >,
) => Transition<Eo, Pc, Tc, T>;

/**
 * Converts a transition configuration to a structured transition object with all functions.
 *
 * @param events - The events map used for action and guard resolution.
 * @param actorsMap - The actors map used for action and guard resolution.
 * @param config - The transition configuration to convert.
 * @param options - Optional machine options that may include actions and predicates configurations.
 * @returns A structured transition object with target, actions, guards, and optional description.
 *
 * @see {@linkcode ToTransition_F} for more details
 * @see {@linkcode toAction} for converting actions
 * @see {@linkcode toPredicate} for converting guards
 * @see {@linkcode toArray.typed} for ensuring typed arrays
 * @see {@linkcode toArray} for ensuring typed arrays
 */
export const toTransition: ToTransition_F = (
  events,
  actorsMap,
  config,
  options,
) => {
  const isString = typeof config === 'string';
  if (isString) return { target: config };
  const { description, target } = config;

  const actions = toArray
    .typed(config.actions)
    .map(action => toAction(events, actorsMap, action, options?.actions));
  const guards = toArray<GuardConfig>(config.guards).map(guard =>
    toPredicate(events, actorsMap, guard, options?.predicates),
  );

  const out = { target, actions, guards } as any;

  if (description) out.description = description;
  return out;
};
