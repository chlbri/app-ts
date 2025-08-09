import type { DEFAULT_DELIMITER } from '../constants/index.js';
import type { types } from '@bemedev/types';
import type { EventsMap, PromiseeMap, ToEvents, ToEventsR } from '../events/index.js';
import type { State, StateExtended, StateP, StatePextended } from '../interpreters/index.js';
export type IsString_F = (value: unknown) => value is string;
/**
 * Single or readonly array type of {@linkcode T}.
 */
export type SingleOrArrayR<T> = T | readonly T[];
/**
 * Single or readonly array type of {@linkcode T} with at least one element.
 * This type is useful when you want to ensure that the value is either a single
 * element of type {@linkcode T} or an array containing at least one element of
 * type {@linkcode T}.
 */
export type SingleOrArrayL<T> = T | readonly [...(readonly T[]), T];
/**
 * Describer keys used to define the name and description of an object.
 */
export declare const DESCRIBER_KEYS: readonly ["name", "description"];
/**
 * Describer type that contains a name and a description.
 */
export type Describer = Record<(typeof DESCRIBER_KEYS)[number], string>;
/**
 * Retrieves the name property from a Describer type.
 */
export type FromDescriber<T extends Describer> = T['name'];
/**
 * A {@linkcode Describer} type where the description property is optional.
 */
export type Describer2 = types.NOmit<Describer, 'description'> & Partial<Pick<Describer, 'description'>>;
export declare const isFunction: (value: unknown) => value is types.Fn;
export declare const isString: IsString_F;
export declare const isDescriber: (arg: any) => arg is Describer;
/**
 * Can be used after
 */
export type NotReadonly<T> = {
    -readonly [P in keyof T]: T[P];
};
/**
 * Can be used after
 */
export type Define<T, U> = T extends undefined ? U : undefined extends T ? types.NotUndefined<T> : T;
/**
 * Option for changing a property access in an object.
 */
type ChangePropertyOption = 'readonly' | 'readonly_undefined' | 'normal' | 'undefined';
/**
 * Changes the property access of a specific property in an object type.
 *
 * @template T - The object type to change.
 * @template name - The name of the property of {@linkcode T} to change.
 * @template replace - The name of the property to replace the original property with.
 * @template : {@linkcode ChangePropertyOption} [option] - The option for changing the property access.
 *
 * @remarks Can be used
 *
 * @see {@linkcode NOmit} for removing a property from an object type.
 */
export type ChangeProperty<T extends object, name extends keyof T, replace extends string, option extends ChangePropertyOption = 'normal'> = types.NOmit<T, name> & (name extends any ? option extends 'readonly' ? {
    +readonly [key in replace]: T[name];
} : option extends 'readonly_undefined' ? {
    +readonly [key in replace]+?: T[name];
} : option extends 'undefined' ? {
    [key in replace]+?: T[name];
} : {
    [key in replace]: T[name];
} : never);
type _KeyStrings<T extends object, AddObjectKey extends boolean = true, Key extends keyof T = keyof T> = Key extends string ? types.NotUndefined<T[Key]> extends object ? {
    [key in keyof T]: (T[key] extends infer T2 extends object ? types.UnionToIntersection<_KeyStrings<T2, AddObjectKey>> : never) & (AddObjectKey extends true ? {
        [key in HighMy]: string;
    } : NonNullable<object>);
} : {
    [key in Key]: string;
} : never;
export type KeyStrings<T extends object, AddObjectKey extends boolean = true, Key extends keyof T = keyof T> = types._UnionToIntersection2<_KeyStrings<T, AddObjectKey, Key>>;
export type HighMy = '@my';
type __ChangeProperties<T extends object, U extends types.DeepPartial<KeyStrings<T>> = types.DeepPartial<KeyStrings<T>>> = {
    [key in keyof T as key extends keyof U ? U[key] extends infer U1 ? U1 extends {
        [key in HighMy]: string;
    } ? U1[HighMy] : U1 extends string ? U1 : key : never : key]: key extends keyof U ? T[key] extends infer T1 extends object ? Omit<U[key], HighMy> extends infer U1 extends types.DeepPartial<KeyStrings<T1, true>> ? __ChangeProperties<T1, U1> : never : T[key] : T[key];
};
type _ChangeProperties<T extends object, U extends types.DeepPartial<KeyStrings<T>> = types.DeepPartial<KeyStrings<T>>, option extends Extract<ChangePropertyOption, 'normal' | 'undefined'> = 'normal'> = __ChangeProperties<T, U> extends infer Tn ? option extends 'undefined' ? types.DeepPartial<Tn> : Tn : never;
/**
 * Changes the properties of an object type based on a partial object type.
 *
 * @template T - The object type to change.
 * @template U - The partial object type that defines the changes.
 * @template : {@linkcode ChangePropertyOption} [option] - The option for changing the property access.
 *
 * @remarks This can be usefull after
 *
 * @see {@linkcode DeepPartial} for creating a deep partial type.
 * @see {@linkcode KeyStrings} for creating a type with string keys.
 * @see {@linkcode _ChangeProperties} for changing a single property access.
 */
export type ChangeProperties<T extends object, U extends types.DeepPartial<KeyStrings<T>> = types.DeepPartial<KeyStrings<T>>, option extends Extract<ChangePropertyOption, 'normal' | 'undefined'> = 'normal'> = types.DeepPartial<KeyStrings<T>> extends U ? T : _ChangeProperties<T, U, option>;
/**
 * Remap an object by adding an `__id` property.
 *
 * @template T - The object type to remap.
 */
export type Identitfy<T> = T extends object ? T & {
    __id: string;
} : T;
/**
 * A helper type to reduce an array type to its element type.
 * It extracts the element type from an array type, whether it is a readonly array or a
 * mutable array.
 *
 * @template T - The type to reduce.
 */
export type ReduceArray<T> = T extends readonly (infer U1)[] ? U1 : T extends (infer U2)[] ? U2 : T;
/**
 * An helper to write common function signatures.
 *
 * @template : {@linkcode EventsMap} [E] - The events map used in the function.
 * @template : {@linkcode PromiseeMap} [P] - The promisees map used in the function.
 * @template Pc - The private context.
 * @template : {@linkcode types.PrimitiveObject} [Tc] - The context of the function, defaults to any object.
 * @template R - The return type of the function, defaults to any.
 *
 * @see {@linkcode ToEvents} for converting events and promisees to a map.
 */
export type FnR<E extends EventsMap = EventsMap, P extends PromiseeMap = PromiseeMap, Pc extends types.PrimitiveObject = types.PrimitiveObject, Tc extends types.PrimitiveObject = types.PrimitiveObject, R = any> = (state: StateExtended<Pc, Tc, ToEvents<E, P>>) => R;
/**
 * A helper type to reduce a function signature to its context and events map.
 *
 * @template : {@linkcode EventsMap} [E] - The events map used in the function.
 * @template : {@linkcode PromiseeMap} [P] - The promisees map used in the function.
 * @template : {@linkcode types.PrimitiveObject} [Tc] - The context of the function, defaults to any object.
 * @template R - The return type of the function, defaults to any.
 *
 * @remarks This function signature is a reduced version of {@linkcode FnR} without the private context.
 *
 * @see {@linkcode ToEvents} for converting events and promisees to a map.
 */
export type FnReduced<E extends EventsMap = EventsMap, P extends PromiseeMap = PromiseeMap, Tc extends types.PrimitiveObject = types.PrimitiveObject, R = any> = (state: State<Tc, ToEvents<E, P>>) => R;
/**
 * A helper type to reduce a function signature to its context and events map.
 *
 * @template : {@linkcode EventsMap} [E] - The events map used in the function.
 * @template : {@linkcode PromiseeMap} [P] - The promisees map used in the function.
 * @template : {@linkcode types.PrimitiveObject} [Tc] - The context of the function, defaults to any object.
 * @template R - The return type of the function, defaults to any.
 *
 * @see {@linkcode ToEvents} for converting events and promisees to a map.
 * @see {@linkcode FnReduced} for a more generic function signature.
 * @see {@linkcode Extract}
 */
export type FnMap2<E extends EventsMap = EventsMap, P extends PromiseeMap = PromiseeMap, Tc extends types.PrimitiveObject = types.PrimitiveObject, R = any, TT extends ToEventsR<E, P> = ToEventsR<E, P>> = {
    [key in TT['type']]?: (state: StateP<Tc, Extract<TT, {
        type: key;
    }>['payload']>) => R;
} & {
    else?: FnReduced<E, P, Tc, R>;
};
export type EventToType<T extends string | {
    type: string;
}> = T extends {
    type: infer U extends string;
} ? U : T extends string ? T : never;
type _FnMap<E extends EventsMap = EventsMap, P extends PromiseeMap = PromiseeMap, Pc extends types.PrimitiveObject = types.PrimitiveObject, Tc extends types.PrimitiveObject = types.PrimitiveObject, R = any, TT extends ToEvents<E, P> = ToEvents<E, P>> = {
    [key in EventToType<TT>]?: (state: StatePextended<Pc, Tc, Extract<TT, {
        type: key;
    }>['payload']>) => R;
} & {
    else?: FnR<E, P, Pc, Tc, R>;
};
type _FnMapR<E extends EventsMap = EventsMap, P extends PromiseeMap = PromiseeMap, Tc extends types.PrimitiveObject = types.PrimitiveObject, R = any, TT extends ToEvents<E, P> = ToEvents<E, P>> = {
    [key in EventToType<TT>]?: (state: StateP<Tc, Extract<TT, {
        type: key;
    }>['payload']>) => R;
} & {
    else?: FnReduced<E, P, Tc, R>;
};
export type FnMap<E extends EventsMap = EventsMap, P extends PromiseeMap = PromiseeMap, Pc extends types.PrimitiveObject = types.PrimitiveObject, Tc extends types.PrimitiveObject = types.PrimitiveObject, R = any> = FnR<E, P, Pc, Tc, R> | _FnMap<E, P, Pc, Tc, R, ToEvents<E, P>>;
export type FnMapR<E extends EventsMap = EventsMap, P extends PromiseeMap = PromiseeMap, Tc extends types.PrimitiveObject = types.PrimitiveObject, R = any> = FnReduced<E, P, Tc, R> | _FnMapR<E, P, Tc, R, ToEvents<E, P>>;
/**
 * A type that represents a record with string keys and values of type {@linkcode T}.
 *
 * @see {@linkcode Record} for more details.
 */
export type RecordS<T> = Record<string, T>;
/**
 * A type that represents all values of type {@linkcode T},
 *
 * @see {@linkcode NotUndefined}
 */
export type ValuesOf<T> = types.NotUndefined<types.NotUndefined<T>[keyof types.NotUndefined<T>]>;
/**
 * A type that represents a record with string keys and values of type {@linkcode R}.
 *
 * @template S - The string keys of the record.
 * @template R - The type of the values in the record, optional
 *
 * @see {@linkcode Record} for more details.
 * @remarks Simplified version of {@linkcode Record}
 */
export type KeyU<S extends string, R = unknown> = Record<S, R>;
/**
 * The partial version of {@linkcode KeyU}.
 *
 * @template S - The string keys of the record.
 * @template R - The type of the values in the record, optional
 *
 * @see {@linkcode Partial}
 */
export type KeyO<S extends string, R = unknown> = Partial<KeyU<S, R>>;
/**
 * Extracts the string type from a union type {@linkcode T}.
 *
 * @template T - The union type to extract the string type from.
 *
 * @see {@linkcode Extract} for more details.
 */
export type ExtractS<T> = Extract<T, string>;
/**
 * A type that represents a true object, which is an object that does not have
 * any iterable properties or the `SymbolConstructor` property.
 *
 * @remarks This type is useful to ensure that the object is a plain object
 * without any special properties.
 *
 * @see {@linkcode Ru} for a utility type that represents a true object.
 * @see {@linkcode SymbolConstructor} for the symbol constructor type.
 */
export type TrueObject = types.Ru & {
    [Symbol.iterator]?: never;
};
/**
 * A type that represents a not defined.
 *
 * @remarks This type is useful when you want to allow a value to be absent or
 * explicitly set to `null` or `undefined`.
 *
 * @remarks Can be usefull after.
 *
 */
export type NoValue = void | undefined | null;
export type Delimiter = typeof DEFAULT_DELIMITER;
export {};
//# sourceMappingURL=primitives.d.ts.map