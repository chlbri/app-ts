import type { Identitfy } from '../../../globals/types';

type Identify_F = <const T>(arg?: Record<string, T>) => Identitfy<T>[];

/**
 * identify variable - Auto-generated expression
 *
 * ⚠️ WARNING: This expression is auto-generated and should not be modified.
 * Any manual changes will be overwritten during the next generation.
 *
 * @generated
 * @readonly
 * @author chlbri (bri_lvi@icloud.com)
 */
export const identify: Identify_F = arg => {
  if (!arg) return [];
  const entries = Object.entries(arg);

  const out: any[] = entries.map(([__id, value]) => {
    const out2 = { ...value, __id };
    return out2;
  });

  return out;
};
