import type { SingleOrArray } from '@bemedev/boolean-recursive';
import type {
  DeepPartial,
  Fn,
  NOmit,
  NotUndefined,
  Primitive,
  TuplifyUnion,
  Unionize,
  UnionToIntersection,
} from '@bemedev/types';
import type { EventObject, EventsMap, ToEvents } from '~events';
import type { StateType, StateValue } from '~states';
import { checkKeys } from '~utils';

type isArray_F = <T>(value: unknown) => value is T[];
export type IsString_F = (value: unknown) => value is string;
export type SingleOrArrayR<T> = T | readonly T[];
export type SingleOrArrayL<T> = T | readonly [...(readonly T[]), T];

export const DESCRIBER_KEYS = ['name', 'description'] as const;
export const isArray: isArray_F = value => Array.isArray(value);

export type Describer = Record<(typeof DESCRIBER_KEYS)[number], string>;

export type FromDescriber<T extends Describer> = T['name'];

export type Describer2 = NOmit<Describer, 'description'> &
  Partial<Pick<Describer, 'description'>>;

export type ToDescriber_F = (arg: string | Describer) => Describer2;

export const isFunction = (value: unknown): value is Fn => {
  return typeof value === 'function';
};

export const isString: IsString_F = value => {
  return typeof value === 'string';
};

export const isDescriber = (arg: any): arg is Describer => {
  const out = checkKeys(arg, ...DESCRIBER_KEYS);
  return out;
};

export type ExtractLargeKeys<T> = string extends T
  ? never
  : number extends T
    ? never
    : symbol extends T
      ? never
      : T;

type _Simplify<T> = T extends { new: any }
  ? T
  : T extends Fn
    ? Fn<SimplifyArray<Parameters<T>>, ReturnType<T>>
    : T extends object
      ? {
          [P in keyof T as ExtractLargeKeys<P>]: T[P] extends object
            ? Simplify<T[P]>
            : T[P];
        }
      : T;

export type Simplify<T, S = unknown> = Extract<_Simplify<T>, S>;

export type IdxOf<T extends any[]> = Exclude<keyof T, keyof any[]>;

export type _SimplifyArray<T extends any[]> = {
  [K in IdxOf<T>]: Simplify<T[K]>;
};

export type SimplifyArray<T extends any[]> = TuplifyUnion<
  ValuesOf<_SimplifyArray<T>>
>;

export type NotReadonly<T> = {
  -readonly [P in keyof T]: T[P];
};

export type NotR<T> = NotReadonly<T>;

export type Expr<
  TContext extends object = object,
  TEvents extends EventObject = EventObject,
  T = any,
> = Fn<[TContext, TEvents], T>;

export type Define<T, U> = T extends undefined
  ? U
  : undefined extends T
    ? NotUndefined<T>
    : T;

export interface PrimitiveObjectMap {
  readonly [key: string]: SingleOrArray<PrimitiveObject>;
}

export type PrimitiveObject = Primitive | PrimitiveObjectMap;

export type DeUnionize<T> = T extends any ? T : never;

export type DefaultReturn = <T>(params: {
  _return?: T;
  error: Error;
  config: {
    strict?: boolean;
    value: T;
  };
}) => T;

export type ReducedDefaultReturn<T> = (error: Error, _return?: T) => T;
export type RDR<T> = ReducedDefaultReturn<T>;

export type PropertyToChange<T extends object> = [keyof T, string];
export type PtC<T extends object> = PropertyToChange<T>;

type ChangePropertyOption =
  | 'readonly'
  | 'readonly_undefined'
  | 'normal'
  | 'undefined';

export type ChangeProperty<
  T extends object,
  name extends keyof T,
  replace extends string,
  option extends ChangePropertyOption = 'undefined',
> = NOmit<T, name> &
  (name extends any
    ? option extends 'readonly'
      ? { +readonly [key in replace]: T[name] }
      : option extends 'readonly_undefined'
        ? { +readonly [key in replace]+?: T[name] }
        : option extends 'undefined'
          ? { [key in replace]+?: T[name] }
          : { [key in replace]: T[name] }
    : never);

export interface StringMap {
  [key: string]: _StringMap;
}

type _StringMap = string | StringMap;

type _KeyStrings<
  T extends object,
  AddObjectKey extends boolean = true,
  Key extends keyof T = keyof T,
> = Key extends string
  ? NotUndefined<T[Key]> extends object
    ? {
        [key in keyof T]: (T[key] extends infer T2 extends object
          ? UnionToIntersection<_KeyStrings<T2, AddObjectKey>>
          : never) &
          (AddObjectKey extends true
            ? { '@my': string }
            : NonNullable<object>);
      }
    : { [key in Key]: string }
  : never;

export type KeyStrings<
  T extends object,
  AddObjectKey extends boolean = true,
  Key extends keyof T = keyof T,
> = UnionToIntersection<_KeyStrings<T, AddObjectKey, Key>>;

export type HighMy = '@my';

type __ChangeProperties<
  T extends object,
  U extends DeepPartial<KeyStrings<T>> = DeepPartial<KeyStrings<T>>,
> = {
  [key in keyof T as key extends keyof U
    ? U[key] extends infer U1
      ? U1 extends { [key in HighMy]: string }
        ? U1[HighMy]
        : U1 extends string
          ? U1
          : key
      : never
    : key]: key extends keyof U
    ? T[key] extends infer T1 extends object
      ? Omit<U[key], HighMy> extends infer U1 extends DeepPartial<
          KeyStrings<T1, true>
        >
        ? __ChangeProperties<T1, U1>
        : never
      : T[key]
    : T[key];
};

type _ChangeProperties<
  T extends object,
  U extends DeepPartial<KeyStrings<T>> = DeepPartial<KeyStrings<T>>,
  option extends Extract<
    ChangePropertyOption,
    'normal' | 'undefined'
  > = 'normal',
> =
  __ChangeProperties<T, U> extends infer Tn
    ? option extends 'undefined'
      ? DeepPartial<Tn>
      : Tn
    : never;

export type ChangeProperties<
  T extends object,
  U extends DeepPartial<KeyStrings<T>> = DeepPartial<KeyStrings<T>>,
  option extends Extract<
    ChangePropertyOption,
    'normal' | 'undefined'
  > = 'normal',
> =
  DeepPartial<KeyStrings<T>> extends U
    ? T
    : _ChangeProperties<T, U, option>;

export type Identitfy<T> = T extends object ? T & { __id: string } : T;

export type Identify_F = <const T>(
  arg?: Record<string, T>,
) => Identitfy<T>[];

export type Asyncfy_F = <P extends any[], R = any>(
  fn: Fn<P, R>,
) => Fn<P, Promise<R>>;

export type AnifyReturn<T extends Fn> = (...args: Parameters<T>) => any;

export type CheckKeys_F = <T extends object>(
  arg: T,
  ...keys: string[]
) => boolean;

export interface ToArray_F {
  <T>(obj: any): T[];
  typed: <T>(obj: T | T[] | readonly T[]) => Exclude<T, undefined>[];
}

export type ToArray<T> = T extends any[] ? T : T[];

export type EscapeRexExp_F = (arg: string) => string;

export type ReplaceAll_F = (params: {
  entry: string;
  match: string;
  replacement: string;
}) => string;

export type RecomposeSV_F = Fn<[arg?: string], StateValue>;

export type DeleteFirst_F = Fn<[arg: string, toDelete: string], string>;
export type DeleteF_F = Fn<[arg: string, toDelete?: string], string>;

export type ReduceArray<T> = T extends readonly (infer U1)[]
  ? U1
  : T extends (infer U2)[]
    ? U2
    : T;

type _ConcatKeys<T extends object, U extends object> =
  Unionize<T> extends infer TT
    ? TT extends Record<infer S1 extends string | number, infer R1>
      ? Unionize<U> extends infer UU
        ? UU extends Record<infer S2 extends string | number, infer R2>
          ? Record<`${S1}&&${S2}`, [R1, R2]>
          : never
        : never
      : never
    : never;

export type ConcatKeys<
  T extends object,
  U extends object,
> = UnionToIntersection<_ConcatKeys<T, U>>;

export type FnMap2<
  E extends EventsMap = EventsMap,
  Tc extends PrimitiveObject = PrimitiveObject,
  R = any,
> =
  | ({
      [key in keyof E]: (context: Tc, payload: E[key]) => R;
    } & {
      else?: (context: Tc, eventsMap: ToEvents<E>) => R;
      machine$$then: (context: Tc, events: any) => R;
      machine$$catch: (context: Tc, events: any) => R;
    })
  | ({
      [key in keyof E]?: (context: Tc, payload: E[key]) => R;
    } & {
      else: (context: Tc, eventsMap: ToEvents<E>) => R;
      machine$$then?: (context: Tc, events: any) => R;
      machine$$catch?: (context: Tc, events: any) => R;
    });

type _FnMap<
  E extends EventsMap = EventsMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  R = any,
> =
  | ({
      [key in keyof E]: (pContext: Pc, context: Tc, payload: E[key]) => R;
    } & {
      else?: (pContext: Pc, context: Tc, eventsMap: ToEvents<E>) => R;
      machine$$then: (pContext: Pc, context: Tc, events: any) => R;
      machine$$catch: (pContext: Pc, context: Tc, events: any) => R;
    })
  | ({
      [key in keyof E]?: (pContext: Pc, context: Tc, payload: E[key]) => R;
    } & {
      else: (pContext: Pc, context: Tc, eventsMap: ToEvents<E>) => R;
      machine$$then?: (pContext: Pc, context: Tc, events: any) => R;
      machine$$catch?: (pContext: Pc, context: Tc, events: any) => R;
    });

export type _FnMapR<
  E extends EventsMap = EventsMap,
  Tc extends PrimitiveObject = PrimitiveObject,
  R = any,
> =
  | ({
      [key in keyof E]: (context: Tc, payload: E[key]) => R;
    } & {
      else?: (context: Tc, eventsMap: ToEvents<E>) => R;
      machine$$then: (context: Tc, events: any) => R;
      machine$$catch: (context: Tc, events: any) => R;
    })
  | ({
      [key in keyof E]?: (context: Tc, payload: E[key]) => R;
    } & {
      else: (context: Tc, eventsMap: ToEvents<E>) => R;
      machine$$then?: (context: Tc, events: any) => R;
      machine$$catch?: (context: Tc, events: any) => R;
    });

export const MAP_CONCATENER = '&&';

export type MapConcatener = typeof MAP_CONCATENER;

type _ConcatFnMap<T extends object, U extends object> =
  Unionize<T> extends infer TT
    ? TT extends Record<
        infer S1 extends string | number,
        (context: infer Tc1, eventsMap: infer E1) => infer R
      >
      ? Unionize<U> extends infer UU
        ? UU extends Record<
            infer S2 extends string | number,
            (context: infer Tc2, eventsMap: infer E2) => any
          >
          ? Record<
              `${S1}${MapConcatener}${S2}`,
              (contexts: [Tc1, Tc2], map: [E1, E2]) => R
            >
          : never
        : never
      : never
    : never;

type ConcatFnMap2<
  T extends object,
  U extends object,
> = UnionToIntersection<_ConcatFnMap<T, U>>;

export type ConcatFnMap<T extends object, U extends object> =
  ConcatFnMap2<T, U> extends infer TU
    ? Omit<
        TU,
        | `else&&${string}`
        | `${string}&&else`
        | `machine$$then&&${string}`
        | `${string}&&machine$$then`
        | `machine$$catch&&${string}`
        | `${string}&&machine$$catch`
      > & {
        else: `else&&else` extends keyof TU ? TU[`else&&else`] : never;
      }
    : never;

export type FnMap<
  E extends EventsMap = EventsMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  R = any,
> =
  | ((pContext: Pc, context: Tc, eventsMap: ToEvents<E>) => R)
  | _FnMap<E, Pc, Tc, R>;

export type FnMapReduced<
  E extends EventsMap = EventsMap,
  Tc extends PrimitiveObject = PrimitiveObject,
  R = any,
> = ((context: Tc, eventsMap: ToEvents<E>) => R) | _FnMapR<E, Tc, R>;

export type EventsMapFromFn<F extends FnMap> =
  F extends FnMap<infer P> ? P : never;

export type ExtractPrivateFromFn<F extends FnMap> =
  F extends FnMap<any, infer Pc> ? Pc : never;

export type ExtractContextFromFn<F extends FnMap> =
  F extends FnMap<any, any, infer Tc> ? Tc : never;

export type ExtractReturnFromFn<F extends FnMap> =
  F extends FnMap<any, any, any, infer R> ? R : never;

export type RecordS<T> = Record<string, T>;

export type Keys<T> = keyof NotUndefined<T>;

export type ValuesOf<T> = NotUndefined<
  NotUndefined<T>[keyof NotUndefined<T>]
>;

export type StateMap = {
  states?: Record<string, StateMap>;
  type: StateType;
  id: string;
};

export type KeyU<S extends string, R = unknown> = Record<S, R>;

export type KeyO<S extends string, R = unknown> = Partial<KeyU<S, R>>;
