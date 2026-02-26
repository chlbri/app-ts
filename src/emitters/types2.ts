import type { PrimitiveObject } from '#bemedev/globals/types';
import type { ActorsConfigMap, EventsMap } from '#events';
import type { Transition } from '#transitions';
import type { Observable } from 'rxjs';
import type { Describer, RecordS } from '~types';

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
  E extends EventsMap = EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  R = any,
> = {
  src: Observable<R>;
  description?: string;
  next: Transition<E, A, Pc, Tc>[];
  error: Transition<E, A, Pc, Tc>[];
  complete: Transition<E, A, Pc, Tc>[];
};

export type EmitterMap = Partial<RecordS<Observable<any>>>;
