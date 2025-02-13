import type { Fn } from "@bemedev/types";
import type { NodeConfig, NodeConfigWithInitials } from "src/machine/types";
import type { StateType } from "../types";

export  type StateType_F = Fn<[state: NodeConfig | NodeConfigWithInitials], StateType>;

export const stateType: StateType_F = config => {
  const type = config.type;
  if (type) return type;
  const states = (config as any).states;
  if (states) {
    const len = Object.keys(states).length;
    if (len > 0) {
      return 'compound';
    }
  }

  return 'atomic';
};