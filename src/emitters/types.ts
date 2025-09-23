import type { EventArg, EventsMap, PromiseeMap, ToEvents } from '#events';
import type { StateExtended } from '#interpreters';
import type { DirectMerge_F } from '#machines';
import type { types } from '@bemedev/types';
import type { RecordS } from '~types';

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

export type EmitterMap<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
> = Partial<RecordS<Emitter<E, P, Pc, Tc>>>;
