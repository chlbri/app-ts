import type { SingleOrArray } from '@bemedev/boolean-recursive';
import type {
  DeepPartial,
  Fn,
  NOmit,
  NotUndefined,
  Primitive,
  Ru,
  TuplifyUnion,
  UnionToIntersection,
} from '@bemedev/types';
import type {
  EventObject,
  EventsMap,
  PromiseeMap,
  ToEvents,
  ToEventsR,
} from '~events';
import type { StateType, StateValue } from '~states';
import { checkKeys } from '~utils';

export type IsString_F = (value: unknown) => value is string;
export type SingleOrArrayR<T> = T | readonly T[];
export type SingleOrArrayL<T> = T | readonly [...(readonly T[]), T];

export const DESCRIBER_KEYS = ['name', 'description'] as const;

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

export type PrimitiveObject = Primitive | Primitive[] | PrimitiveObjectMap;

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

export type FnMap2<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Tc extends PrimitiveObject = PrimitiveObject,
  R = any,
  TT extends ToEventsR<E, P> = ToEventsR<E, P>,
> = {
  [key in TT['type']]?: (
    context: Tc,
    payload: Extract<TT, { type: key }>['payload'],
  ) => R;
} & {
  else?: (context: Tc, eventsMap: ToEvents<E, P>) => R;
};

type _FnMap<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc = any,
  R = any,
  TT extends ToEventsR<E, P> = ToEventsR<E, P>,
> = {
  [key in TT['type']]?: (
    pContext: Pc,
    context: Tc,
    payload: Extract<TT, { type: key }>['payload'],
  ) => R;
} & {
  else?: (pContext: Pc, context: Tc, eventsMap: ToEvents<E, P>) => R;
};

type _FnMapR<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Tc extends PrimitiveObject = PrimitiveObject,
  R = any,
  TT extends ToEventsR<E, P> = ToEventsR<E, P>,
> = {
  [key in TT['type']]?: (
    context: Tc,
    payload: Extract<TT, { type: key }>['payload'],
  ) => R;
} & {
  else?: (context: Tc, eventsMap: ToEvents<E, P>) => R;
};

export type FnMap<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc = any,
  R = any,
> =
  | ((pContext: Pc, context: Tc, eventsMap: ToEvents<E, P>) => R)
  | _FnMap<E, P, Pc, Tc, R, ToEventsR<E, P>>;

export type FnMapReduced<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Tc extends PrimitiveObject = PrimitiveObject,
  R = any,
> =
  | ((state: Tc, eventsMap: ToEventsR<E, P>) => R)
  | _FnMapR<E, P, Tc, R, ToEventsR<E, P>>;

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

export type ExtractS<T> = Extract<T, string>;

export type TrueObject = Ru & {
  [Symbol.iterator]?: never;
  //@ts-expect-error - 'SymbolConstructor' does not exist on type 'object'
  [SymbolConstructor]?: never;
};

export type NoValue = void | undefined | null;
