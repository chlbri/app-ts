import {
  AnyArray,
  Fn,
  NOmit,
  PrimitiveObject,
  SoRa,
} from '../../globals/types';
import {
  CUSTOM,
  PARTIAL,
  PRIMITIVE_OBJECTS,
  PRIMITIVES,
} from './constants';

/**
 * PrimitiveS type - Auto-generated expression
 *
 * ⚠️ WARNING: This expression is auto-generated and should not be modified.
 * Any manual changes will be overwritten during the next generation.
 *
 * @generated
 * @readonly
 * @author chlbri (bri_lvi@icloud.com)
 */
export type PrimitiveS = (typeof PRIMITIVES)[number];

/**
 * TransformS type - Auto-generated expression
 *
 * ⚠️ WARNING: This expression is auto-generated and should not be modified.
 * Any manual changes will be overwritten during the next generation.
 *
 * @generated
 * @readonly
 * @author chlbri (bri_lvi@icloud.com)
 */
export type TransformS<T extends PrimitiveS> = T extends 'string'
  ? string
  : T extends 'number'
    ? number
    : T extends 'boolean'
      ? boolean
      : T extends 'bigint'
        ? bigint
        : T extends 'symbol'
          ? symbol
          : T extends 'undefined'
            ? undefined
            : T extends 'null'
              ? null
              : never;

/**
 * MapS type - Auto-generated expression
 *
 * ⚠️ WARNING: This expression is auto-generated and should not be modified.
 * Any manual changes will be overwritten during the next generation.
 *
 * @generated
 * @readonly
 * @author chlbri (bri_lvi@icloud.com)
 */
export type MapS = {
  [key: string]: ObjectS;
};

/**
 * Custom type - Auto-generated expression
 *
 * ⚠️ WARNING: This expression is auto-generated and should not be modified.
 * Any manual changes will be overwritten during the next generation.
 *
 * @generated
 * @readonly
 * @author chlbri (bri_lvi@icloud.com)
 */
export type Custom<T = any> = {
  [CUSTOM]: T;
};

/**
 * PartialCustom type - Auto-generated expression
 *
 * ⚠️ WARNING: This expression is auto-generated and should not be modified.
 * Any manual changes will be overwritten during the next generation.
 *
 * @generated
 * @readonly
 * @author chlbri (bri_lvi@icloud.com)
 */
export type PartialCustom = {
  [PARTIAL]: undefined;
};

/**
 * _ObjectS type - Auto-generated expression
 *
 * ⚠️ WARNING: This expression is auto-generated and should not be modified.
 * Any manual changes will be overwritten during the next generation.
 *
 * @generated
 * @readonly
 * @author chlbri (bri_lvi@icloud.com)
 */
export type _ObjectS =
  | MapS
  | PrimitiveS
  | Custom
  | PartialCustom
  | (typeof PRIMITIVE_OBJECTS)[number];

/**
 * ObjectS type - Auto-generated expression
 *
 * ⚠️ WARNING: This expression is auto-generated and should not be modified.
 * Any manual changes will be overwritten during the next generation.
 *
 * @generated
 * @readonly
 * @author chlbri (bri_lvi@icloud.com)
 */
export type ObjectS = SoRa<_ObjectS>;

/**
 * TransformO type - Auto-generated expression
 *
 * ⚠️ WARNING: This expression is auto-generated and should not be modified.
 * Any manual changes will be overwritten during the next generation.
 *
 * @generated
 * @readonly
 * @author chlbri (bri_lvi@icloud.com)
 */
export type TransformO<T> = T extends 'function'
  ? Fn
  : T extends PrimitiveS
    ? TransformS<T>
    : T extends 'date'
      ? Date
      : T extends 'object'
        ? // eslint-disable-next-line @typescript-eslint/no-empty-object-type
          {}
        : T extends 'primitive'
          ? PrimitiveObject
          : T extends PartialCustom
            ? Partial<TransformO<NOmit<T, typeof PARTIAL>>>
            : T extends AnyArray<any>
              ? T[number] extends infer TKN extends ObjectS
                ? TransformO<TKN>[]
                : never
              : {
                  [K in keyof T]: TransformO<T[K]>;
                };
