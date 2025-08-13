import type { NodeConfigParallel } from '../../types';

export function isParallel(arg: unknown): arg is NodeConfigParallel {
  return (arg as any).type === 'parallel';
}
