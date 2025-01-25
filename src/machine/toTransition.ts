import { isString } from 'src/types/primitives';
import { toAction, type ActionConfig } from '~actions';
import { toPredicate, type GuardConfig } from '~guards';
import { toArray } from '~utils';
import type { ToTransition_F } from './types';

export const toTransition: ToTransition_F = (
  config,
  options,
  strict = false,
) => {
  const __id = (config as any).__id;
  if (isString(config)) {
    const target = toArray<string>(config);
    return { target, actions: [], guards: [], in: [] };
  }

  const { description } = config;
  const target = toArray<string>(config.target);

  const actions = toArray<ActionConfig>(config.actions).map(action =>
    toAction({ action, actions: options?.actions as any, strict }),
  );
  const guards = toArray<GuardConfig>(config.guards).map(guard =>
    toPredicate({ guard, predicates: options?.guards as any, strict }),
  );

  const out = { target, actions, guards } as any;

  if (description) out.description = description;
  out.in = toArray(config.in);
  if (__id) out.__id = __id;

  return out;
};
