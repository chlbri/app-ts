import { type Ru } from '@bemedev/types';
import type { ActionResult } from '~actions';
import type { EventsMap, PromiseeMap, ToEvents } from '~events';
import { type FnMap, type PrimitiveObject } from '~types';
import { reduceFnMap } from '~utils';
import { assignByKey } from './subcriber';

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
) => (
  pContext: Pc,
  context: Tc,
  eventsMap: ToEvents<E, P>,
) => ActionResult<Pc, Tc>;

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
