import { PrimitiveObject } from '#bemedev/globals/types';
import {
  EventsMap,
  ActorsConfigMap,
  ToEventObject,
  ToEvents,
} from '#events';
import { SimpleMachineOptions } from '#machines';
import { resolveNode as resolve, NodeConfig, Node } from '#states';

export type ResolveNodeHelper_Fn = <
  E extends EventsMap = EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
  Eo extends ToEventObject<ToEvents<E, A>> = ToEventObject<
    ToEvents<E, A>
  >,
  L = typeof resolve<E, A, Pc, Tc, T, Eo>,
>(
  legacy: L,
) => void;

type ResolveNode_Fn = <
  E extends EventsMap = EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
  Eo extends ToEventObject<ToEvents<E, A>> = ToEventObject<
    ToEvents<E, A>
  >,
  L = typeof resolve<E, A, Pc, Tc, T, Eo>,
>(
  legacy: L,
  events: E,
  actorsMap: A,
  config: NodeConfig,
  options: SimpleMachineOptions<E, A, Pc, Tc, T, Eo>,
  helper: (
    legacy: L,
    events: E,
    actorsMap: A,
    config: NodeConfig,
    options: SimpleMachineOptions<E, A, Pc, Tc, T, Eo>,
  ) => Node<Eo, Pc, Tc, T>,
) => Node<Eo, Pc, Tc, T>;

export const resolveNode: ResolveNode_Fn = (
  legacy,
  events,
  actorsMap,
  config,
  options,
  helper,
) => {
  const out = helper(legacy, events, actorsMap, config, options);
  return out;
};
