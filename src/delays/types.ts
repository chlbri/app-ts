import type { EventsMap } from '~events';
import type { FnMap, PrimitiveObject } from '~types';

export type Delay<
  E extends EventsMap = EventsMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = number | FnMap<E, Pc, Tc, number>;

export type DelayMap<
  E extends EventsMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = Partial<Record<string, Delay<E, Pc, Tc>>>;
