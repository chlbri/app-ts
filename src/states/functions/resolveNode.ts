import { toArray } from '@bemedev/basifun';
import { identify } from '@bemedev/basifun/objects/identify';
import { t, type NOmit } from '@bemedev/types';
import { toAction } from '~actions';
import type { EventsMap } from '~events';
import type { SimpleMachineOptions } from '~machines';
import { toPromise } from '~promises';
import { toTransition } from '~transitions';
import type { PrimitiveObject } from '~types';
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
  // #region functions for mapping
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
  const tags = toArray.typed(_tags);
  const entry = toArray.typed(config.entry).map(aMapper);
  const exit = toArray.typed(config.exit).map(aMapper);

  const states = identify(config.states).map(config =>
    resolveNode(events, config, options),
  );

  const on = identify(config.on).map(tMapper);
  const always = toArray.typed(config.always).map(tMapper);
  const after = identify(config.after).map(tMapper);
  const promises = toArray
    .typed(config.promises)
    .map(promise => toPromise(events, promise, options));

  const out = t.any({
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
