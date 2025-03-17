/* eslint-disable @typescript-eslint/no-empty-object-type */
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

type Keys = string | number | symbol;

type _TypingsFn = <T = any>(value?: unknown) => T;
export type Typings = _TypingsFn & {
  forceCast: <T = any>(value: unknown) => T;
  cast: <const T = any>(value: T) => T;
  interpret: <T extends AnyMachine>(machine: T) => InterpreterFrom<T>;
  number: <T extends number = number>(value?: T) => T;
  string: <T extends string = string>(value?: T) => T;
  boolean: <T extends boolean = boolean>(value?: T) => T;
  partial: <T extends object = object>(value?: T) => Partial<T>;
  deepPartial: <T extends object = object>(value?: T) => DeepPartial<T>;
  array: <const T extends any[] = any[]>(...values: T) => T[number][];
  tuple: <const T extends any[] = any[]>(...values: T) => T;
  recordS: <T = any>(value: T) => Record<string, T>;

  recordAll: <T = any, const V extends Keys[] = Keys[]>(
    value: T,
    ...values: V
  ) => Record<V[number], T>;

  function: <Args extends any[] = any[], R = any>(
    ...args: [...Args, R]
  ) => Fn<Args, R>;

  context: <T extends PrimitiveObject = PrimitiveObject>(value?: T) => T;
  config: <T extends Config = Config>(value?: T) => T;
  machine: <T extends AnyMachine>(machine: T) => T;

  promiseDef: <T = any, C = any>(
    then: T,
    _catch: C,
  ) => {
    then: T;
    catch: C;
  };

  toEventsR: <E extends EventsMap, P extends PromiseeMap>(
    events: E,
    promisees: P,
  ) => ToEventsR<E, P>;

  toEvents: <E extends EventsMap, P extends PromiseeMap>(
    events: E,
    promisees: P,
  ) => ToEvents<E, P>;

  createMachine: CreateMachine_F;
  notUndefined: <T = any>(value?: T) => NonNullable<T>;
  undefiny: <const T = any>(value: T) => T | undefined;

  date: Date;
  never: never;
  null: null;
  undefined: undefined;
  rn: Rn;
  ru: Ru;
  ra: Ra;
  symbol: symbol;
  bigint: bigint;
  object: {};
  any: any;
};

const _fn0 = () => undefined as any;
const ERROR = new Error('This is a never type') as never;

export const typings: Typings = () => _fn0();
typings.forceCast = value => value as any;
typings.cast = value => value;
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
typings.any = _fn0();
