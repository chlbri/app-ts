import type { NodeConfigAtomic } from "src/machine/types";
import { stateType } from "../stateType";

export function isAtomic(arg: any): arg is NodeConfigAtomic {
  const out = stateType(arg) === 'atomic';
  return out;
}
