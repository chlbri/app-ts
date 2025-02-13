import type { Fn } from '@bemedev/types';
import type { ActionConfig, FromActionConfig } from '~actions';
import type { GUARD_TYPE } from '~constants';
import type { EventsMap, ToEvents } from '~events';
import type { FnMap, PrimitiveObject, RecordS, ReduceArray } from '~types';

type gType = typeof GUARD_TYPE;
type and = gType['and'];
type or = gType['or'];

export type GuardUnion = ActionConfig | GuardAnd | GuardOr;

export type GuardAnd = {
  [k in and]: GuardUnion[];
};

export type GuardOr = {
  [k in or]: GuardUnion[];
};

export type GuardConfig = GuardUnion;

export type FromGuard<T extends GuardConfig> = T extends ActionConfig
  ? FromActionConfig<T>
  : T extends GuardAnd
    ? FromGuard<ReduceArray<T['and']>>
    : T extends GuardOr
      ? FromGuard<ReduceArray<T['or']>>
      : never;

export type PredicateS<
  E extends EventsMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = FnMap<E, Pc, Tc, boolean>;

export type PredicateS2<
  E extends EventsMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = Fn<[Pc, Tc, ToEvents<E>], boolean>;

export type PredicateUnion<
  E extends EventsMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> =
  | PredicateS<E, Pc, Tc>
  | PredicateAnd<E, Pc, Tc>
  | PredicateOr<E, Pc, Tc>;

export type PredicateAnd<
  E extends EventsMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = {
  and: PredicateUnion<E, Pc, Tc>[];
};

export type PredicateOr<
  E extends EventsMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = {
  or: PredicateUnion<E, Pc, Tc>[];
};

export type Predicate<
  E extends EventsMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> =
  | PredicateS2<E, Pc, Tc>
  | PredicateAnd<E, Pc, Tc>
  | PredicateOr<E, Pc, Tc>;

export type PredicateMap<
  E extends EventsMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = Partial<RecordS<PredicateS<E, Pc, Tc>>>;
