import type { StateValue } from '~states';
import type { NodeConfigWithInitials } from './types';

export type ValueToConfig_F = <T extends StateValue>(
  body: NodeConfigWithInitials,
  from: T,
  initial?: boolean,
) => NodeConfigWithInitials;
