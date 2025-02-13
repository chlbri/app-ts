import type { NodeConfigParallel } from "src/machine/types";

export function isParallel(arg: unknown): arg is NodeConfigParallel {
  return (arg as any).type === 'parallel';
}
