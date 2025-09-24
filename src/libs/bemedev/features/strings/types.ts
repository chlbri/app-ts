import { ENGLISH_LETTERS } from './constants';

/**
 * LowerLetters type - Auto-generated expression
 *
 * ⚠️ WARNING: This expression is auto-generated and should not be modified.
 * Any manual changes will be overwritten during the next generation.
 *
 * @generated
 * @readonly
 * @author chlbri (bri_lvi@icloud.com)
 */
export type LowerLetters = (typeof ENGLISH_LETTERS)[number];

/**
 * UpperLetters type - Auto-generated expression
 *
 * ⚠️ WARNING: This expression is auto-generated and should not be modified.
 * Any manual changes will be overwritten during the next generation.
 *
 * @generated
 * @readonly
 * @author chlbri (bri_lvi@icloud.com)
 */
export type UpperLetters = Uppercase<LowerLetters>;

/**
 * Letters type - Auto-generated expression
 *
 * ⚠️ WARNING: This expression is auto-generated and should not be modified.
 * Any manual changes will be overwritten during the next generation.
 *
 * @generated
 * @readonly
 * @author chlbri (bri_lvi@icloud.com)
 */
export type Letters = UpperLetters | LowerLetters;

// export type StringLocalLitterals = Letters | Digit;

/**
 * Email type - Auto-generated expression
 *
 * ⚠️ WARNING: This expression is auto-generated and should not be modified.
 * Any manual changes will be overwritten during the next generation.
 *
 * @generated
 * @readonly
 * @author chlbri (bri_lvi@icloud.com)
 */
export type Email = `${string}@${string}.${string}`;

/**
 * _JoinStringHelper type - Auto-generated expression
 *
 * ⚠️ WARNING: This expression is auto-generated and should not be modified.
 * Any manual changes will be overwritten during the next generation.
 *
 * @generated
 * @readonly
 * @author chlbri (bri_lvi@icloud.com)
 */
export type _JoinStringHelper = string | number | boolean | bigint;

/**
 * JoinString type - Auto-generated expression
 *
 * ⚠️ WARNING: This expression is auto-generated and should not be modified.
 * Any manual changes will be overwritten during the next generation.
 *
 * @generated
 * @readonly
 * @author chlbri (bri_lvi@icloud.com)
 */
export type JoinString<
  T extends readonly string[],
  sep extends string = ' ',
> = T extends []
  ? ''
  : T extends [_JoinStringHelper]
    ? `${T[0]}`
    : T extends [_JoinStringHelper, ...infer U extends readonly string[]]
      ? `${T[0]}${sep}${JoinString<U, sep>}`
      : string;

/**
 * AddString type - Auto-generated expression
 *
 * ⚠️ WARNING: This expression is auto-generated and should not be modified.
 * Any manual changes will be overwritten during the next generation.
 *
 * @generated
 * @readonly
 * @author chlbri (bri_lvi@icloud.com)
 */
export type AddString<
  T,
  Before extends string = '',
  After extends string = '',
> = `${Before}${T & string}${After}`;

/**
 * StringEndWith type - Auto-generated expression
 *
 * ⚠️ WARNING: This expression is auto-generated and should not be modified.
 * Any manual changes will be overwritten during the next generation.
 *
 * @generated
 * @readonly
 * @author chlbri (bri_lvi@icloud.com)
 */
export type StringEndWith<
  S extends string,
  E extends string,
> = S extends `${infer Prev}${E}`
  ? { response: true; full: S; prev: Prev }
  : { response: false; full: S; prev: S };

/**
 * StringStartWith type - Auto-generated expression
 *
 * ⚠️ WARNING: This expression is auto-generated and should not be modified.
 * Any manual changes will be overwritten during the next generation.
 *
 * @generated
 * @readonly
 * @author chlbri (bri_lvi@icloud.com)
 */
export type StringStartWith<
  S extends string,
  E extends string,
> = S extends `${E}${infer Next}`
  ? { response: true; full: S; next: Next }
  : { response: false; full: S; next: S };

/**
 * StringContains type - Auto-generated expression
 *
 * ⚠️ WARNING: This expression is auto-generated and should not be modified.
 * Any manual changes will be overwritten during the next generation.
 *
 * @generated
 * @readonly
 * @author chlbri (bri_lvi@icloud.com)
 */
export type StringContains<
  S extends string,
  E extends string,
> = S extends `${infer Prev}${E}${infer Next}`
  ? { response: true; full: S; prev: Prev; next: Next }
  : { response: false; full: S; prev: string; next: string };

/**
 * Credit to {@link https://stackoverflow.com/a/70831818/11704485 | Matthieu Riegler}
 */
/**
 * SplitStringBy type - Auto-generated expression
 *
 * ⚠️ WARNING: This expression is auto-generated and should not be modified.
 * Any manual changes will be overwritten during the next generation.
 *
 * @generated
 * @readonly
 * @author chlbri (bri_lvi@icloud.com)
 */
export type SplitStringBy<
  S extends string,
  By extends string = '.',
> = string extends S
  ? string[]
  : S extends ''
    ? []
    : S extends `${infer T}${By}${infer U}`
      ? [T, ...SplitStringBy<U, By>]
      : [S];

/**
 * ExtractS type - Auto-generated expression
 *
 * ⚠️ WARNING: This expression is auto-generated and should not be modified.
 * Any manual changes will be overwritten during the next generation.
 *
 * @generated
 * @readonly
 * @author chlbri (bri_lvi@icloud.com)
 */
export type ExtractS<T> = Extract<T, string>;
