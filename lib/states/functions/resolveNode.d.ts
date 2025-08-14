import type { EventsMap, PromiseeMap } from '../../events/index.js';
import type { SimpleMachineOptions } from '../../machine/index.js';
import { type types } from '@bemedev/types';
import type { Node, NodeConfig } from '../types';
export type ResolveNode_F = <E extends EventsMap = EventsMap, P extends PromiseeMap = PromiseeMap, Pc = any, Tc extends types.PrimitiveObject = types.PrimitiveObject>(events: E, promisees: P, config: NodeConfig, options?: SimpleMachineOptions<E, P, Pc, Tc>) => Node<E, P, Pc, Tc>;
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
export declare const resolveNode: ResolveNode_F;
//# sourceMappingURL=resolveNode.d.ts.map