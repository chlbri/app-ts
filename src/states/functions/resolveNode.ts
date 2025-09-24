import { toAction } from '#actions';
import _any from '#bemedev/features/common/castings/any';
import type { PrimitiveObject } from '#bemedev/globals/types';
import type { EventsMap, PromiseeMap } from '#events';
import type { SimpleMachineOptions } from '#machines';
import { toPromise } from '#promises';
import { toTransition } from '#transitions';
import { toArray } from '@bemedev/basifun';
import { identify } from '@bemedev/basifun/objects/identify';
import type { Node, NodeConfig } from '../types';
import { stateType } from './stateType';

export type ResolveNode_F = <
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
>(
  events: E,
  promisees: P,
  config: NodeConfig,
  options?: SimpleMachineOptions<E, P, Pc, Tc>,
) => Node<E, P, Pc, Tc>;

/**
 * Resolves a node configuration into a full node with all functions.
 *
 * @param events - The events map used for action and transition resolution.
 * @param promisees - The promisees map used for promise resolution.
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
  promisees,
  config,
  options,
) => {
  // #region functions for mapping
  const aMapper = (action: any) => {
    return toAction(events, promisees, action, options?.actions);
  };

  const tMapper = (config: any) => {
    return toTransition(events, promisees, config, options);
  };
  // #endregion

  const { description, initial, tags: _tags } = config;
  const __id = (config as any).__id;
  const type = stateType(config);
  const tags = toArray.typed(_tags);
  const entry = toArray.typed(config.entry).map(aMapper);
  const exit = toArray.typed(config.exit).map(aMapper);

  const states = identify(config.states).map(config =>
    resolveNode(events, promisees, config, options),
  );

  const on = identify(config.on).map(tMapper);
  const always = toArray.typed(config.always).map(tMapper);
  const after = identify(config.after).map(tMapper);
  const promises = toArray
    .typed(config.promises)
    .map(promise => toPromise(events, promisees, promise, options));

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
  });

  if (__id) out.__id = __id;
  if (initial) out.initial = initial;
  if (description) out.description = description;

  return out;
};
