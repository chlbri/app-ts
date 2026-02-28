import { toAction } from '#actions';
import _any from '#bemedev/features/common/castings/any';
import type { PrimitiveObject } from '#bemedev/globals/types';
import type { EventsMap, ActorsConfigMap } from '#events';
import type { Config, SimpleMachineOptions } from 'src/machine/types';
import { toPromise } from '#promises';
import { toTransition } from '#transitions';
import { toArray } from '@bemedev/basifun';
import { identify } from '@bemedev/basifun/objects/identify';
import type { Node, NodeConfig } from '../types';
import { stateType } from './stateType';
import { toEmitter } from '#emitters';
import { toChild } from '#machines';

export type ResolveNode_F = <
  C extends Config = Config,
  E extends EventsMap = EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
>(
  events: E,
  actorsMap: A,
  config: NodeConfig,
  options?: SimpleMachineOptions<E, A, Pc, Tc>,
) => Node<C, E, A, Pc, Tc>;

/**
 * Resolves a node configuration into a full node with all functions.
 *
 * @param events - The events map used for action and transition resolution.
 * @param actorsMap - The promisees map used for promise resolution.
 * @param config - The node configuration to resolve.
 * @param options - Optional machine options that may include actions and promises configurations.
 * @returns A structured representation of the node with its properties and transitions.
 *
 * @see {@linkcode ResolveNode_F} for more details
 * @see {@linkcode toAction} for converting actions
 * @see {@linkcode toTransition} for converting transitions
 * @see {@linkcode toPromise} for converting promises
 * @see {@linkcode toArray.typed} for ensuring typed arrays
 * @see {@linkcode stateType} for determining the type of the state
 * @see {@linkcode identify} for identifying properties in the configuration
 *
 */
export const resolveNode: ResolveNode_F = (
  events,
  actorsMap,
  config,
  options,
) => {
  // #region functions for mapping
  const aMapper = (action: any) => {
    return toAction(events, actorsMap, action, options?.actions);
  };

  const tMapper = (config: any) => {
    return toTransition(events, actorsMap, config, options);
  };
  // #endregion

  const { description, initial, tags: _tags } = config;
  const __id = (config as any).__id;
  const type = stateType(config);
  const tags = toArray.typed(_tags);
  const entry = toArray.typed(config.entry).map(aMapper);
  const exit = toArray.typed(config.exit).map(aMapper);

  const states = identify(config.states).map(config =>
    resolveNode(events, actorsMap, config, options),
  );

  const on = identify(config.on).map(tMapper);
  const always = toArray.typed(config.always).map(tMapper);
  const after = identify(config.after).map(tMapper);
  const actors = toArray.typed(config.actors);

  const promises = actors
    .filter(actor => 'then' in actor)
    .map(promise => toPromise(events, actorsMap, promise, options));

  const emitters = actors
    .filter(actor => 'next' in actor)
    .map(emitter => toEmitter(events, actorsMap, emitter, options));

  const children = actors
    .filter(actor => 'on' in actor || 'contexts' in actor)
    .map(child => toChild(events, actorsMap, child, options));

  const out = _any({
    type,
    entry,
    exit,
    tags,
    states,
    on,
    always,
    after,
    promises,
    emitters,
    children,
  });

  if (__id) out.__id = __id;
  if (initial) out.initial = initial;
  if (description) out.description = description;

  return out;
};
