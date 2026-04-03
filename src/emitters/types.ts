import type {
  NotUndefined,
  PrimitiveObject,
} from '#bemedev/globals/types';
import type { ActorsConfigMap, EventObject } from '#events';
import type { StateExtended } from '#states';
import type { Transition } from '#transitions';
import type { RecordS } from '~types';

export type Subscriber = {
  unsubscribe: () => void;
};

export type Subscribable = {
  subscribe: Subscriber;
};

/**
 * Observer wired into a {@linkcode Pausable} via its `subscribe` method.
 * Mirrors the shape expected by `@bemedev/rx-pausable`'s SubArgs.
 */
export type EmitterObserver<R = any> = {
  next: (value: R) => void;
  error: (err: any) => void;
  complete: () => void;
};

/**
 * Minimal pausable interface — intentionally framework-agnostic so the lib
 * does not pull in RxJS as a peer dependency.
 *
 * Implementations (e.g. the class returned by `createPausable` from
 * `@bemedev/rx-pausable`) must satisfy this shape.
 *
 * @template R - The value type emitted by the underlying source.
 */
export type Pausable<R = any> = {
  /** Wire the observer that will receive forwarded events. */
  subscribe: (observer: EmitterObserver<R>) => void;
  /** Start consuming the source — has no effect if not stopped. */
  start: () => void;
  /** Stop the stream and remove any pending timers. */
  stop: () => void;
  /**
   * Suspend forwarding while buffering incoming events.
   * Has no effect if already paused or stopped.
   */
  pause: () => void;
  /**
   * Replay buffered events then resume live forwarding.
   * Has no effect if not paused.
   */
  resume: () => void;
};

/** The string id that references an emitter source in the options map. */
export type EmitterSrcConfig = string;

export type EmitterDef = {
  next: PrimitiveObject;
  error: PrimitiveObject;
};

export type EmitterConfigMap = RecordS<EmitterDef>;

export type Emitter<
  E extends EventObject = EventObject,
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

export type EmitterFunction2<
  E extends EventObject = EventObject,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
  R = any,
> = (state: StateExtended<E, Pc, Tc, T>) => Pausable<R>;

export type EmittersMap<
  E extends EventObject = EventObject,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
> = RecordS<EmitterFunction2<E, Pc, Tc, T>>;
