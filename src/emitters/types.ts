import type {
  NotUndefined,
  PrimitiveObject,
} from '#bemedev/globals/types';
import type { ActorsConfigMap, AllEvent } from '#events';
import type { Transition } from '#transitions';
import type { Observable } from 'rxjs';
import type { Describer, FnMap, FnR, RecordS } from '~types';

export type Subscriber = {
  unsubscribe: () => void;
};

export type Subscribable = {
  subscribe: Subscriber;
};

/**
 * Type representing a describer for a emitter.
 *
 * @see {@linkcode Describer} for more details.
 */
export type EmitterSrcConfig = Describer | string;

export type EmitterDef = {
  next: PrimitiveObject;
  error: PrimitiveObject;
};

export type EmitterConfigMap = RecordS<EmitterDef>;

export type Emitter<
  E extends AllEvent = AllEvent,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
  R = any,
> = {
  src: EmitterFunction2<E, Pc, Tc, T, R>;
  description?: string;
  next: Transition<E, Pc, Tc, T>[];
  error: Transition<E, Pc, Tc, T>[];
  complete: Transition<E, Pc, Tc, T>[];
};

export type EmitterReturn<
  K extends string,
  A extends ActorsConfigMap = ActorsConfigMap,
> = NotUndefined<A['emitters']>[K]['next'] extends infer P
  ? unknown extends P
    ? never
    : P
  : never;

export type EmitterFunction<
  E extends AllEvent = AllEvent,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
  R = any,
> = FnMap<E, Pc, Tc, T, Observable<R>, `${string}::${'next' | 'error'}`>;

export type EmitterFunction2<
  E extends AllEvent = AllEvent,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
  R = any,
> = FnR<E, Pc, Tc, T, Observable<R>>;

export type EmittersMap<
  E extends AllEvent = AllEvent,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
> = RecordS<EmitterFunction<E, Pc, Tc, T>>;
