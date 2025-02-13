import type {
  NodeConfigParallel,
  NodeConfigParallelWithInitials,
} from '../../types';

export function isParallel(
  arg: unknown,
): arg is NodeConfigParallelWithInitials | NodeConfigParallel {
  return (arg as any).type === 'parallel';
}
