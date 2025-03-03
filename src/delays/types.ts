import type { EventsMap, PromiseeMap } from '~events';
import type { FnMap, PrimitiveObject } from '~types';

export type Delay<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = number | FnMap<E, P, Pc, Tc, number>;

export type DelayMap<
  E extends EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = Partial<Record<string, Delay<E, P, Pc, Tc>>>;
