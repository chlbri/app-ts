import type { NodeConfigCompoundWithInitials } from '../../types';
import { stateType } from '../stateType';

export function isCompound(
  arg: any,
): arg is NodeConfigCompoundWithInitials {
  const out = stateType(arg) === 'compound';
  return out;
}
