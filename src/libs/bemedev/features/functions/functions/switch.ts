type _SwitchValue_F = <T>(params: {
  condition?: boolean;
  truthy: T;
  falsy: T;
}) => T;

const _switchValue: _SwitchValue_F = ({ condition, truthy, falsy }) => {
  const out = condition ? truthy : falsy;
  return out;
};

type ParamsO<T> = {
  condition?: boolean;
  truthy: T;
  falsy: T;
};

type ParamsA<T> = [condition: boolean, first: T, second: T];

/**
 * switchValue function - Auto-generated expression
 *
 * ⚠️ WARNING: This expression is auto-generated and should not be modified.
 * Any manual changes will be overwritten during the next generation.
 *
 * @generated
 * @readonly
 * @author chlbri (bri_lvi@icloud.com)
 */
export function switchValue<T>(params: ParamsO<T>): T;
/**
 * switchValue function - Auto-generated expression
 *
 * ⚠️ WARNING: This expression is auto-generated and should not be modified.
 * Any manual changes will be overwritten during the next generation.
 *
 * @generated
 * @readonly
 * @author chlbri (bri_lvi@icloud.com)
 */
export function switchValue<T>(...args: ParamsA<T>): T;

/**
 * switchValue function - Auto-generated expression
 *
 * ⚠️ WARNING: This expression is auto-generated and should not be modified.
 * Any manual changes will be overwritten during the next generation.
 *
 * @generated
 * @readonly
 * @author chlbri (bri_lvi@icloud.com)
 */
export function switchValue<T>(condition: any, truthy?: T, falsy?: T) {
  const check1 = typeof condition === 'boolean';

  return _switchValue({
    condition: check1,
    truthy: _switchValue({
      condition,
      truthy,
      falsy,
    }),
    falsy: _switchValue(condition),
  });
}

switchValue.array = <T>(...params: ParamsA<T>) => switchValue(...params);
switchValue.object = <T>(params: ParamsO<T>) => switchValue(params);

/**
 * switchV variable - Auto-generated expression
 *
 * ⚠️ WARNING: This expression is auto-generated and should not be modified.
 * Any manual changes will be overwritten during the next generation.
 *
 * @generated
 * @readonly
 * @author chlbri (bri_lvi@icloud.com)
 */
export const switchV = switchValue;
