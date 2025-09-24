import type { EventArg, EventsMap, PromiseeMap, ToEvents } from '#events';
import type { StateExtended } from '#interpreters';
import type { DirectMerge_F } from '#machines';
import type { types } from '@bemedev/types';
import type { Describer, RecordS } from '~types';

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
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
> = (args: {
  merge: DirectMerge_F<Pc, Tc>;
  send: (event: EventArg<E>) => void;
  selector: <T>(
    func: (state: StateExtended<Pc, Tc, ToEvents<E, P>>) => T,
  ) => () => T;
}) => {
  start: () => void;
  stop: () => void;
};

export type Emitter2<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
> = {
  id: string;
  emitter: Emitter<E, P, Pc, Tc>;
};

export type EmitterMap<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
> = Partial<RecordS<Emitter<E, P, Pc, Tc>>>;
