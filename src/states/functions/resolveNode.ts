import { t, type NOmit } from '@bemedev/types';
import { toAction, type ActionConfig } from '~actions';
import type { EventsMap } from '~events';
import type { SimpleMachineOptions } from '~machines';
import { toPromise, type PromiseConfig } from '~promises';
import { toTransition, type TransitionConfig } from '~transitions';
import type { PrimitiveObject } from '~types';
import { identify, toArray } from '~utils';
import type { Node, NodeConfigWithInitials } from '../types';
import { stateType } from './stateType';

export type ResolveNode_F = <
  E extends EventsMap = EventsMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
>(
  events: E,
  config: NodeConfigWithInitials,
  options?: NOmit<SimpleMachineOptions<E, Pc, Tc>, 'initials'>,
) => Node<E, Pc, Tc>;

export const resolveNode: ResolveNode_F = (events, config, options) => {
  // #region functions
  const aMapper = (action: any) => {
    return toAction(events, action, options?.actions);
  };

  const tMapper = (config: any) => {
    return toTransition(events, config, options);
  };
  // #endregion

  const { id, description, initial, tags: _tags } = config;
  const __id = (config as any).__id;
  const type = stateType(config);
  const tags = toArray<string>(_tags);
  const entry = toArray<ActionConfig>(config.entry).map(aMapper);
  const exit = toArray<ActionConfig>(config.exit).map(aMapper);

  const states = identify(config.states).map(config =>
    resolveNode(events, config, options),
  );

  const on = identify(config.on).map(tMapper);
  const always = toArray<TransitionConfig>(config.always).map(tMapper);
  const after = identify(config.after).map(tMapper);
  const promises = toArray<PromiseConfig>(config.promises).map(promise =>
    toPromise(events, promise, options),
  );

  const out = t.anify<any>({
    type,
    entry,
    exit,
    tags,
    states,
    on,
    always,
    after,
    promises,
  });

  if (__id) out.__id = __id;
  if (initial) out.initial = initial;
  if (id) out.id = id;
  if (description) out.description = description;

  return out;
};
