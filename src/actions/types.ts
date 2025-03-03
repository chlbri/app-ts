import type { DeepPartial, Fn } from '@bemedev/types';
import type { EventsMap, PromiseeMap, ToEvents } from '~events';
import type {
  Describer,
  FnMap,
  FromDescriber,
  PrimitiveObject,
} from '~types';

export type ActionConfig = string | Describer;

export type FromActionConfig<T extends ActionConfig> = T extends Describer
  ? FromDescriber<T>
  : T;

export type Action<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = FnMap<E, P, Pc, Tc, ActionResult<Pc, Tc>>;

export type ActionMap<
  E extends EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = Partial<Record<string, Action<E, P, Pc, Tc>>>;

export type ActionResult<
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = DeepPartial<{
  pContext: Pc;
  context: Tc;
}>;

export type Action2<
  E extends EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = Fn<[Pc, Tc, ToEvents<E, P>], ActionResult<Pc, Tc>>;
