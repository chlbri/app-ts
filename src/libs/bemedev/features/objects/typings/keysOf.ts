import { _unknown } from '../../../globals/utils/_unknown';
import { expandFn } from '../../../globals/utils/expandFn';

/**
 * fn const - Auto-generated expression
 *
 * ⚠️ WARNING: This expression is auto-generated and should not be modified.
 * Any manual changes will be overwritten during the next generation.
 *
 * @generated
 * @readonly
 * @author chlbri (bri_lvi@icloud.com)
 */
const fn = expandFn(<T extends object>(_?: T) => _unknown<(keyof T)[]>(), {
  union: <T extends object>(_?: T) => _unknown<keyof T>(),
});

export default fn;
