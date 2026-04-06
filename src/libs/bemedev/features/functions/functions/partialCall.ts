import type { Parts, Fn, PartDiff } from '../types';
import { AnyArray } from '../../../globals/types';
import { expandFn } from '../../../globals/utils/expandFn';

type PartialCall_F = <
  const F extends Fn,
  const T extends Parts<Parameters<F>> = Parts<Parameters<F>>,
  const U extends PartDiff<Parameters<F>, T> = PartDiff<Parameters<F>, T>,
>(
  f: F,
  ...headArgs: T
) => (...tailArgs: U) => ReturnType<F>;

type PartialCallArray_F = <
  T extends AnyArray = AnyArray,
  U extends AnyArray = AnyArray,
  R = any,
>(
  f: Fn<[...T, ...U], R>,
  ...headArgs: T
) => (...tailArgs: U) => R;

type PartialCallBuild_F = <
  const F extends Fn,
  const T extends Parts<Parameters<F>> = Parts<Parameters<F>>,
  const U extends PartDiff<Parameters<F>, T> = PartDiff<Parameters<F>, T>,
>(
  f: F,
  ...headArgs: T
) => <
  const T extends Fn<[...U], ReturnType<F>> = Fn<[...U], ReturnType<F>>,
>(
  ...tailArgs: Parameters<T>
) => ReturnType<T>;

const __partialCall = (f: Fn, ...headArgs: any[]) => {
  return (...tailArgs: any[]) => f(...headArgs, ...tailArgs);
};

const _partialCall: PartialCall_F = __partialCall;

/**
 * @param f The function to test
 * @param headArgs First arguments for reducing
 * @returns A new function without the ***headArgs*** provided
 *
 * This function allows you to partially apply a function by providing some of its initial arguments (the "head" arguments). The returned function will then expect the remaining arguments (the "tail" arguments) when called. This is useful for creating new functions with some preset parameters, making it easier to reuse code and create more specific functions from general ones.
 */
/**
 * partialCall variable - Auto-generated expression
 *
 * ⚠️ WARNING: This expression is auto-generated and should not be modified.
 * Any manual changes will be overwritten during the next generation.
 *
 * @generated
 * @readonly
 * @author chlbri (bri_lvi@icloud.com)
 */
export const partialCall = expandFn(_partialCall, {
  /**
   * Use with caution, as it can lead to type inference issues. It's recommended to use the `typed` version instead for better type safety.
   *
   * @param f The function to test
   * @param headArgs First arguments for reducing
   * @returns A new function without the ***headArgs*** provided
   */
  low: __partialCall,

  /**
   *
   * @param f The function to test
   * @param headArgs First arguments for reducing
   * @returns A new function without the ***headArgs*** provided
   *
   * Use this for function that have a large number of parameters use param array as the last parameter, this will allow you to partially apply the function without having to specify all the parameters in the type signature. However, it can lead to type inference issues and is less type-safe than the `typed` version. Use it when you need to partially apply a function with a variable number of parameters.
   *
   * Example usage:
   * ```ts
   * const concatenate = (separator: string, ...strings: string[]) => strings.join(separator);
   * const commaSeparated = partialCall.paramArray(concatenate, ',');
   * console.log(commaSeparated('Hello', 'World'));
   * // Output: "Hello,World"
   *
   * ```
   *
   */
  paramArray: __partialCall as PartialCallArray_F,

  /**
   *
   * @param f The function to test
   * @param headArgs First arguments for reducing
   * @returns A new function without the ***headArgs*** provided
   *
   * @see {linkcode partialCall.paramArray}
   * It's alias for `paramArray` version.
   */
  array: __partialCall as PartialCallArray_F,

  /**
   *
   * @param f The function to test
   * @param headArgs First arguments for reducing
   * @returns A new function without the ***headArgs*** provided
   *
   * This version is more flexible but less type-safe, as it doesn't enforce the types of the head and tail arguments. Use it when you need to partially apply a function without strict type constraints.
   *
   * Example usage:
   * ```ts
   * const add = (a: number, b: number) => a + b;
   * const add5 = partialCall.typed(add, 5);
   * console.log(add5(10)); // Output: 15
   *
   * ```
   */
  typed: _partialCall,

  /**
   *
   * @param f The function to test
   * @param headArgs First arguments for reducing
   * @returns A new function without the ***headArgs*** provided
   *
   * Use with caution, as it can lead to type inference issues. It's recommended to use the `typed` version instead for better type safety.
   *
   * This version is more flexible but less type-safe, as it doesn't enforce the types of the head and tail arguments. Use it when you need to partially apply a function without strict type constraints.
   *
   * Example usage:
   * ```ts
   * const add = (a: number, b: number) => a + b;
   * const add5 = partialCall.build(add, 5);
   * console.log(add5(10)); // Output: 15
   *
   * ```
   *
   */
  build: ((f, ...headArgs) => {
    const head: any = headArgs ?? [];
    return (...tailArgs) => f(...head, ...tailArgs);
  }) as PartialCallBuild_F,
});
