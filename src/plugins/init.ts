import { PrimitiveObject } from '#bemedev/globals/types';
import {
  EventsMap,
  ActorsConfigMap,
  ToEventObject,
  ToEvents,
} from '#events';
import { Config, AnyMachine } from '#machines';
import { State, Node } from '#states';
import { Mode } from '#interpreters';

export type InitHelper_Fn = <
  C extends Config = Config,
  E extends EventsMap = EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
  Eo extends ToEventObject<ToEvents<E, A>> = ToEventObject<
    ToEvents<E, A>
  >,
  LL = {
    config: C;
    machine: AnyMachine<E, A, Pc, Tc>;
    exact: boolean;
    initialNode: Node<Eo, Pc, Tc, T>;
    mode: Mode;
    state: State<Eo, Tc, T>;
  },
  L extends LL = LL,
>(
  legacy: L,
) => void;

type Init_Fn = <
  const C extends Config = Config,
  E extends EventsMap = EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
  Eo extends ToEventObject<ToEvents<E, A>> = ToEventObject<
    ToEvents<E, A>
  >,
  LL = {
    config: C;
    machine: AnyMachine<E, A, Pc, Tc>;
    exact: boolean;
    initialNode: Node<Eo, Pc, Tc, T>;
    mode: Mode;
    state: State<Eo, Tc, T>;
  },
  L extends LL = LL,
>(
  legacy: L,
  helper: (legacy: L) => void,
) => L;

export const init: Init_Fn = (legacy, helper) => {
  helper(legacy);
  return legacy;
};
