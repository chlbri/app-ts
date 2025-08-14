import type { NodeConfigCompound } from '#states';
import { stateType } from '../stateType';

export function isCompound(arg: any): arg is NodeConfigCompound {
  const out = stateType(arg) === 'compound';
  return out;
}
