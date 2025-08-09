import { type ActionConfig } from '../index.js';
export type ReduceAction_F = (action: ActionConfig) => string;
/**
 * Reduces an ActionConfig to its name if it is a describer, otherwise returns the action as is.
 * @param action of type {@linkcode ActionConfig}, action to reduce
 * @returns prop "name" if the action is a describer, otherwise the action itself.
 *
 * @see {@linkcode isDescriber} for more details.
 */
export declare const reduceAction: ReduceAction_F;
//# sourceMappingURL=reduceAction.d.ts.map