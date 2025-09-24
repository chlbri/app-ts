import type { PrimitiveObject } from '#bemedev/globals/types';
import type { EventArg, EventsMap, PromiseeMap, ToEvents } from '#events';
import type { StateExtended } from '#interpreters';
import type { DirectMerge_F } from '#machines';
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
export type EmitterConfig = Describer | string;

export type Emitter<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = (args: {
  merge: DirectMerge_F<Pc, Tc>;
  send: (event: EventArg<E>) => void;
  selector: <T>(
    func: (state: StateExtended<Pc, Tc, ToEvents<E, P>>) => T,
  ) => () => T;
}) => {
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
};

export type Emitter2<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = {
  id: string;
  from: string;
  emitter: Emitter<E, P, Pc, Tc>;
};

export type Emitter3 = {
  id: string;
  from: string;
  instance: {
    start: () => void;
    pause: () => void;
    resume: () => void;
    stop: () => void;
  };
};

export type EmitterMap<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = Partial<RecordS<Emitter<E, P, Pc, Tc>>>;
