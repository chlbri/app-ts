import { expandFn } from '../expandFn';

/**
 * mergeIs variable - Auto-generated expression
 *
 * ⚠️ WARNING: This expression is auto-generated and should not be modified.
 * Any manual changes will be overwritten during the next generation.
 *
 * @generated
 * @readonly
 * @author chlbri (bri_lvi@icloud.com)
 */
export const mergeIs = expandFn(
  <const T extends unknown[]>(...checks: T) => {
    return (value?: unknown): value is T[number] => {
      return checks.some(check => value === check);
    };
  },
  {
    type: <const T extends unknown[]>(...checks: T) => {
      return (value?: unknown): value is T[number] => {
        return checks.some(check => typeof value === check);
      };
    },
  },
);
