import { type Ru } from '@bemedev/types';
import type { ActionResultFn } from '~actions';
import type { EventsMap, PromiseeMap } from '~events';
import { type FnMap, type PrimitiveObject } from '~types';
import { reduceFnMap } from '~utils';
import { assignByKey } from './subcriber';

// #region type Decompose3
// #region type ToPaths
type ToPaths<
  T,
  D extends string = '.',
  P extends string = '',
  Parent extends boolean = false,
> = T extends Ru
  ?
      | Required<{
          [K in keyof T]: ToPaths<
            T[K],
            D,
            `${P}${K & string}${D}`,
            Parent
          >;
        }>[keyof T]
      | (Parent extends true
          ? {
              path: P;
              type: T;
            }
          : never)
  : {
      path: P extends `${infer P}${D}` ? P : never;
      type: T;
    };
// #endregion

// #region FromPaths
type FromPaths<
  T extends {
    path: string;
    type: unknown;
  },
> = {
  [P in T['path']]: Extract<
    T,
    {
      path: P;
    }
  >['type'];
};
// #endregion

/**
 * From "Acid Coder"
 */
type _Decompose3<
  T extends Ru,
  D extends string = '.',
  Parent extends boolean = false,
> = Omit<FromPaths<ToPaths<T, D, '', Parent>>, ''>;

type DecomposeOpions = {
  sep?: string;
  parent?: boolean;
};

/**
 * Decomposes a nested object into a flat object with paths as keys.
 * This type utility takes a nested object type `T` and returns a new type where each key is a path to the original value, separated by a specified separator (default is '.').
 * If the `parent` option is set to `true`, it will also include the parent paths in the keys.
 * @template : type {@linkcode Ru} [T] - The nested object type to decompose.
 * @template : type {@linkcode DecomposeOpions} [O] - Options for decomposition, including `sep` for the separator and `parent
 * @returns : A new type where each key is a path to the original value, with the specified separator.
 *
 * @example
 * ```ts
 * type Nested = {
 *   a: {
 *     b: {
 *       c: string;
 *     };
 *   };
 *   d: number;
 * };
 * type Decomposed = Decompose3<Nested>;
 * // Result: {
 * //   'a.b.c': string;
 * //   'd': number;
 * // }
 * ```
 *
 * @example
 * ```ts
 * type Nested = {
 *   a: {
 *     b: {
 *       c: string;
 *    };
 *  };
 *  d: number;
 * };
 * type DecomposedWithParent = Decompose3<Nested, { parent: true; sep: '/' }>;
 * // Result: {
 * //   'a/b/c': string;
 * //   'a/b': { c: string };
 * //   'a': { b: { c: string } };
 * //   'd': number;
 * // }
 * ```
 */
export type Decompose3<
  T extends Ru,
  O extends DecomposeOpions = { sep: '.'; parent: false },
> =
  _Decompose3<
    T,
    O['sep'] extends string ? O['sep'] : '.',
    O['parent'] extends boolean ? O['parent'] : false
  > extends infer Ty
    ? {
        [K in keyof Ty as K extends `${infer K1}${O['sep'] extends string ? O['sep'] : '.'}`
          ? K1
          : K]: Ty[K];
      }
    : never;
// #endregion

export type ExpandFnMap = <
  Pc,
  Tc extends PrimitiveObject,
  D = Decompose3<{
    pContext: Pc;
    context: Tc;
  }>,
  K extends Extract<keyof D, string> = Extract<keyof D, string>,
  R = D[K],
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
>(
  events: E,
  promisees: P,
  key: K,
  fn: FnMap<E, P, Pc, Tc, R>,
) => ActionResultFn<E, P, Pc, Tc>;
/**
 *
 * @param events : type {@linkcode EventsMap} [E] - The events map.
 * @param promisees  : type {@linkcode PromiseeMap} [P] - The promisees map.
 * @param key  : type {@linkcode Decompose3} [D] - The key to assign the result to in the context and the private context.
 * @param fn  : type {@linkcode FnMap} [E, P, Pc, Tc, R] - The function to reduce the events and promisees and performs the action.
 * @returns a {@linkcode ActionResultFn} function.
 *
 * @see {@linkcode assignByKey} for assigning the result to the context and private context.
 * @see {@linkcode reduceFnMap} for reducing the events and promisees.
 * @see {@linkcode Decompose3} for decomposing the private context and context into paths.
 *
 */
export const expandFnMap: ExpandFnMap = (events, promisees, key, fn) => {
  const _fn = reduceFnMap(events, promisees, fn);

  return (pContext, context, event) => {
    const all = {
      pContext,
      context,
    };
    const result = _fn(pContext, context, event);
    return assignByKey(all, key, result);
  };
};
