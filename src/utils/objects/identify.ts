import type { Identitfy } from '~types';

export type Identify_F = <const T>(
  arg?: Record<string, T>,
) => Identitfy<T>[];

export const identify: Identify_F = arg => {
  if (!arg) return [];
  const entries = Object.entries(arg);

  const out: any[] = entries.map(([__id, value]) => {
    const out2 = { ...value, __id };
    return out2;
  });

  return out;
};
