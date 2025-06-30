import type { ActionConfig } from '~actions';
import { isDescriber } from '~types';

export type ReduceAction_F = (action: ActionConfig) => string;

/**
 * Reduces an ActionConfig to its name if it is a describer, otherwise returns the action as is.
 * @param action ActionConfig to reduce
 * @return prop "name" if the action is a describer, otherwise the action itself.
 */
export const reduceAction: ReduceAction_F = action => {
  if (isDescriber(action)) return action.name;
  return action;
};
