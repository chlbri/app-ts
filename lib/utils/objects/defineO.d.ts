import type { DeepPartial } from '@bemedev/types';
export declare function defineO<T extends object>(
  data?: T,
): NonNullable<T>;
export declare function defineO<T extends object>(
  data?: T,
  parts?: DeepPartial<T>,
): NonNullable<Required<T>>;
//# sourceMappingURL=defineO.d.ts.map
