import type { EventsMap, PromiseeMap } from '../../events/index.js';
import type { SimpleMachineOptions2 } from '../../machine/index.js';
import type { Transition, TransitionConfig } from '../index.js';
import type { types } from '@bemedev/types';
export type ToTransition_F = <E extends EventsMap = EventsMap, P extends PromiseeMap = PromiseeMap, Pc = any, Tc extends types.PrimitiveObject = types.PrimitiveObject>(events: E, promisees: P, config: TransitionConfig & {
    target?: string;
}, options?: Pick<SimpleMachineOptions2, 'actions' | 'predicates'>) => Transition<E, P, Pc, Tc>;
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
 */
export declare const toTransition: ToTransition_F;
//# sourceMappingURL=toTransition.d.ts.map