import { toArray } from '@bemedev/basifun';
import type { types } from '@bemedev/types';
import { toAction } from '~actions';
import type { EventsMap, PromiseeMap } from '~events';
import { toPredicate, type GuardConfig } from '~guards';
import type { SimpleMachineOptions2 } from '~machines';
import type { Transition, TransitionConfig } from '~transitions';
import { isString } from '~types';

export type ToTransition_F = <
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc extends types.PrimitiveObject = types.PrimitiveObject,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
>(
  events: E,
  promisees: P,
  config: TransitionConfig,
  options?: Pick<SimpleMachineOptions2, 'actions' | 'predicates'>,
) => Transition<E, P, Pc, Tc>;

/**
 * Converts a transition configuration to a structured transition object with all functions.
 *
 * @param events - The events map used for action and guard resolution.
 * @param promisees - The promisees map used for promise resolution.
 * @param config - The transition configuration to convert.
 * @param options - Optional machine options that may include actions and predicates configurations.
 * @returns A structured transition object with target, actions, guards, and optional description.
 *
 * @see {@linkcode ToTransition_F} for more details
 * @see {@linkcode toAction} for converting actions
 * @see {@linkcode toPredicate} for converting guards
 * @see {@linkcode toArray.typed} for ensuring typed arrays
 * @see {@linkcode toArray} for ensuring typed arrays
 * @see {@linkcode isString} for checking if the config is a string
 */
export const toTransition: ToTransition_F = (
  events,
  promisees,
  config,
  options,
) => {
  if (isString(config)) {
    const target = toArray<string>(config);
    return { target, actions: [], guards: [], in: [] };
  }

  const { description } = config;
  const target = toArray<string>(config.target);

  const actions = toArray
    .typed(config.actions)
    .map(action => toAction(events, promisees, action, options?.actions));
  const guards = toArray<GuardConfig>(config.guards).map(guard =>
    toPredicate(events, promisees, guard, options?.predicates),
  );

  const out = { target, actions, guards } as any;

  if (description) out.description = description;
  return out;
};
