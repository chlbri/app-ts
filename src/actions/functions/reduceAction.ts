import type { ActionConfig } from '~actions';
import { isDescriber } from '~types';

export type ReduceAction_F = (action: ActionConfig) => string;

export const reduceAction: ReduceAction_F = action => {
  if (isDescriber(action)) return action.name;
  return action;
};
