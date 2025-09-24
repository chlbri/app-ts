import { _unknown } from './_unknown';
import { expandFn } from './expandFn';

/**
 * typeFn variable - Auto-generated expression
 *
 * ⚠️ WARNING: This expression is auto-generated and should not be modified.
 * Any manual changes will be overwritten during the next generation.
 *
 * @generated
 * @readonly
 * @author chlbri (bri_lvi@icloud.com)
 */
export const typeFn = <T = any>() => {
  const _out = <Tr extends object = object>(extensions?: Tr) => {
    const out = expandFn((_?: T) => _unknown<T>(), {
      ...(extensions as Tr),
      forceCast: (_?: unknown) => _unknown<T>(),
      dynamic: <U extends T>(_?: U) => _unknown<U>(),
      is: <U>(_?: U) => _unknown<U extends T ? true : false>(),
      type: _unknown<T>(),
    });

    return out;
  };

  return _out;
};
