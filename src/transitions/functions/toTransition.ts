import { toArray } from '@bemedev/basifun';
import { toAction } from '~actions';
import type { EventsMap, PromiseeMap } from '~events';
import { toPredicate, type GuardConfig } from '~guards';
import type { SimpleMachineOptions2 } from '~machines';
import type { Transition, TransitionConfig } from '~transitions';
import { isString, type PrimitiveObject } from '~types';

export type ToTransition_F = <
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
>(
  events: E,
  promisees: P,
  config: TransitionConfig,
  options?: Pick<SimpleMachineOptions2, 'actions' | 'predicates'>,
) => Transition<E, P, Pc, Tc>;

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
