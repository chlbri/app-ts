import {
  Fn,
  type DeepPartial,
  type Ra,
  type Rn,
  type Ru,
} from '@bemedev/types';
import type { EventsMap, PromiseeMap, ToEvents, ToEventsR } from '~events';
import type { InterpreterFrom } from '~interpreter';
import type { AnyMachine, Config, CreateMachine_F } from '~machines';
import type { PrimitiveObject } from '~types';

export type EmptyObject = NonNullable<unknown>;
export type EmptyO = EmptyObject;

type Keys = string | number | symbol;

type _TypingsFn = <T = any>(value?: unknown) => T;

/**
 * Utility type definitions and helper functions for type manipulation and casting.
 * Provides a comprehensive set of type-safe utilities for common TypeScript operations.
 */
export type Typings = _TypingsFn & {
  /**
   * Forces a value to be cast to type T without type checking.
   * Use with caution as this bypasses TypeScript's type safety.
   */
  forceCast: <T = any>(value: unknown) => T;

  /**
   * Returns the input value with its type preserved as const.
   * Useful for maintaining literal types in function chains.
   */
  cast: <const T = any>(value: T) => T;

  /**
   * Converts any value to the `any` type.
   * Effectively removes all type information from the value.
   */
  anify: (value?: unknown) => any;

  /**
   * Creates an interpreter instance from an XState machine.
   * Returns a properly typed interpreter for the given machine.
   */
  interpret: <T extends AnyMachine>(machine: T) => InterpreterFrom<T>;

  /**
   * Type-safe number identity function.
   * Preserves the exact numeric literal type when possible.
   */
  number: <T extends number = number>(value?: T) => T;

  /**
   * Type-safe string identity function.
   * Preserves the exact string literal type when possible.
   */
  string: <T extends string = string>(value?: T) => T;

  /**
   * Type-safe boolean identity function.
   * Preserves the exact boolean literal type when possible.
   */
  boolean: <T extends boolean = boolean>(value?: T) => T;

  /**
   * Converts an object type to a partial version.
   * Makes all properties optional while preserving the structure.
   */
  partial: <T extends object = object>(value?: T) => Partial<T>;

  /**
   * Converts an object type to a deeply partial version.
   * Recursively makes all nested properties optional.
   */
  deepPartial: <T extends object = object>(value?: T) => DeepPartial<T>;

  /**
   * Creates an array from the union of input values.
   * Returns an array containing all possible value types.
   */
  array: <const T extends any[] = any[]>(...values: T) => T[number][];

  /**
   * Preserves the exact tuple type of input values.
   * Maintains order and specific types of each element.
   */
  tuple: <const T extends any[] = any[]>(...values: T) => T;

  /**
   * Creates a Record type with string keys.
   * Maps all string keys to the provided value type.
   */
  recordS: <T = any>(value: T) => Record<string, T>;

  /**
   * Creates a Record type with specified keys.
   * Maps the union of provided keys to the value type.
   */
  recordAll: <T = any, const V extends Keys[] = Keys[]>(
    value: T,
    ...values: V
  ) => Record<V[number], T>;

  /**
   * Creates a function type from arguments and return type.
   * Last argument is treated as the return type.
   *
   * @remarks At least one argument is required.
   */
  function: <Args extends any[] = any[], R = any>(
    ...args: [...Args, R]
  ) => Fn<Args, R>;

  /**
   * Type-safe context object identity function.
   * Ensures the value conforms to PrimitiveObject constraints.
   */
  context: <T extends PrimitiveObject = PrimitiveObject>(value?: T) => T;

  /**
   * Type-safe config object identity function.
   * Ensures the value conforms to Config type constraints.
   */
  config: <T extends Config = Config>(value?: T) => T;

  /**
   * Type-safe machine identity function.
   * Preserves the exact machine type for XState compatibility.
   */
  machine: <T extends AnyMachine>(machine: T) => T;

  /**
   * Creates a promise definition object with then and catch handlers.
   * Useful for defining promise resolution patterns.
   */
  promiseDef: <T = any, C = any>(
    then: T,
    _catch: C,
  ) => {
    then: T;
    catch: C;
  };

  /**
   * Converts events and promisees to EventsR type.
   * Transforms event mappings for reactive patterns.
   */
  toEventsR: <E extends EventsMap, P extends PromiseeMap>(
    events: E,
    promisees: P,
  ) => ToEventsR<E, P>;

  /**
   * Converts events and promisees to Events type.
   * Transforms event mappings for standard event handling.
   */
  toEvents: <E extends EventsMap, P extends PromiseeMap>(
    events: E,
    promisees: P,
  ) => ToEvents<E, P>;

  /**
   * Factory function for creating XState machines.
   * Provides type-safe machine creation with proper typing.
   */
  createMachine: CreateMachine_F;

  /**
   * Ensures a value is not undefined or null.
   * Returns NonNullable version of the input type.
   */
  notUndefined: <T = any>(value?: T) => NonNullable<T>;

  /**
   * Extracts the keys of an object type.
   * Returns the keyof type for the non-nullable object.
   */
  keysof: <T extends object>(value?: T) => keyof NonNullable<T>;

  /**
   * Safely accesses a property by key.
   * Returns the value type at the specified key.
   */
  byKey: <T extends object, K extends keyof T>(value: T, key: K) => T[K];

  /**
   * Performs type extraction using Extract utility.
   * Filters the type T to only include types assignable to K.
   */
  extract: <T = any, K = any>(value: T, extractor: K) => Extract<T, K>;

  exclude: <T = any, K = any>(value: T, excluder: K) => Exclude<T, K>;

  /**
   * Makes a value potentially undefined.
   * Adds undefined to the union type of the input.
   */
  undefiny: <const T = any>(value: T) => T | undefined;

  /** {@linkcode Date} instance */
  date: Date;

  /** Never type for impossible values */
  never: never;

  /** null primitive value */
  null: null;

  /** Undefined primitive value */
  undefined: undefined;

  /**
   * Returns type {@linkcode Rn}
   */
  rn: Rn;

  /**
   * Returns type {@linkcode Ru}
   */
  ru: Ru;

  /**
   * Returns type {@linkcode Ra}
   */
  ra: Ra;

  /** Symbol primitive type */
  symbol: symbol;

  /** BigInt primitive type */
  bigint: bigint;

  /** Empty object type */
  object: EmptyObject;

  /** Any type for dynamic content */
  any: any;

  identity: <T = any>(value?: T) => T;
};

const _fn0 = () => undefined as any;
const identity = (value?: any) => value;
const ERROR = new Error('This is a never type') as never;

/**
 * A utility set of functions for type casting and manipulation in TypeScript.
 * Provides runtime type helpers that preserve compile-time type information.
 */
export const typings: Typings = () => _fn0();

typings.identity = identity;

typings.any = _fn0();

typings.forceCast = identity;

typings.cast = value => value;

typings.anify = value => value;

typings.interpret = _fn0;

typings.number = _fn0;

typings.string = _fn0;

typings.boolean = _fn0;

typings.partial = _fn0;

typings.deepPartial = _fn0;

typings.array = _fn0;

typings.tuple = _fn0;

typings.recordS = _fn0;

typings.recordAll = _fn0;

typings.function = _fn0;

typings.context = _fn0;

typings.config = _fn0;

typings.machine = _fn0;

typings.promiseDef = (then, _catch) => ({
  then,
  catch: _catch,
});

typings.toEventsR = _fn0;

typings.toEvents = _fn0;

typings.createMachine = _fn0;

typings.notUndefined = _fn0;

typings.undefiny = _fn0;

typings.never = ERROR;

typings.date = _fn0();

typings.null = _fn0();

typings.undefined = _fn0();

typings.rn = _fn0();

typings.ru = _fn0();

typings.ra = _fn0();

typings.symbol = _fn0();

typings.bigint = _fn0();

typings.object = _fn0();

typings.keysof = _fn0;

typings.byKey = _fn0;

typings.extract = _fn0;

typings.exclude = _fn0;
