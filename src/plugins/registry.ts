import { Fn, PrimitiveObject } from '#bemedev/globals/types';
import { _unknown as _unknownFn } from '#bemedev/globals/utils/_unknown';
import {
  ActorsConfigMap,
  EventObject,
  EventsMap,
  ToEventObject,
  ToEvents,
} from '#events';
import { Mode } from '#interpreters';
import {
  AddOption,
  AnyMachine,
  Config,
  MachineOptions,
  SimpleMachineOptions,
} from '#machines';
import { Node, NodeConfig, resolveNode, State } from '#states';
import { partialCall } from '@bemedev/basifun';
import { FnR, RecordS } from '~types';
import {
  START_ORDERED_FNS,
  NEXT_ORDERED_FNS,
  PAUSE_ORDERED_FNS,
  RESUME_ORDERED_FNS,
  STOP_ORDERED_FNS,
} from './constants';

type OptionFn<
  E extends EventObject = EventObject,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
> = Fn<any[], FnR<E, Pc, Tc, T>>;

type Options<
  E extends EventObject = EventObject,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends string = string,
> = RecordS<OptionFn<E, Pc, Tc, T>>;

const orderedFn = <
  const A extends readonly string[],
  T extends Record<A[number], () => any> = Record<A[number], () => any>,
>(
  array: A,
  legacy: T,
  index: keyof T,
  position: 'before' | 'after',
  fn: (legacy: T) => () => void,
) => {
  const _index = array.findIndex(f => f === index);
  const FNS = array.map(fn => (legacy as any)[fn]);
  if (position === 'before') FNS.splice(_index, 0, fn(legacy));
  else FNS.splice(_index + 1, 0, fn(legacy));
  FNS.forEach(f => f());
};

type PartialCall_T<
  A extends readonly string[],
  T = Record<A[number], () => any>,
> = (
  legacy: T,
  index: keyof T,
  position: 'before' | 'after',
  fn: (legacy: T) => () => void,
) => void;

const _partialCall = <A extends readonly string[]>(
  array: A,
): PartialCall_T<A> => partialCall(orderedFn, array);

export const REGISTRY_FNS = {
  get _unknown() {
    return _unknownFn;
  },

  addOptions: <
    E extends EventObject = EventObject,
    Pc = any,
    Tc extends PrimitiveObject = PrimitiveObject,
    T extends string = string,
    const Addons extends Options<E, Pc, Tc, T> = Options<E, Pc, Tc, T>,
  >(
    legacy: AddOption<E, Pc, Tc, T>,
    helpers: (legacy: AddOption<E, Pc, Tc, T>) => Addons,
  ) => {
    const out = {
      ...legacy,
      ...helpers(legacy),
    };

    return out;
  },

  addActors: <
    const C extends Config = Config,
    E extends EventsMap = EventsMap,
    A extends ActorsConfigMap = ActorsConfigMap,
    Pc = any,
    Tc extends PrimitiveObject = PrimitiveObject,
    T extends string = string,
    Mo extends MachineOptions<C, E, A, Pc, Tc, T> = MachineOptions<
      C,
      E,
      A,
      Pc,
      Tc,
      T
    >,
    Eo extends ToEventObject<ToEvents<E, A>> = ToEventObject<
      ToEvents<E, A>
    >,
    const Addons extends RecordS<RecordS<FnR<Eo, Pc, Tc, T>>> = RecordS<
      RecordS<FnR<Eo, Pc, Tc, T>>
    >,
  >(
    legacy: Mo,
    helper: (legacy: Mo) => Addons,
  ) => {
    const out = {
      ...legacy,
      actors: {
        ...legacy.actors,
        ...helper(legacy),
      },
    };

    return out;
  },

  init: <
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
  ) => {
    helper(legacy);
    return legacy;
  },

  resolveNode: <
    E extends EventsMap = EventsMap,
    A extends ActorsConfigMap = ActorsConfigMap,
    Pc = any,
    Tc extends PrimitiveObject = PrimitiveObject,
    T extends string = string,
    Eo extends ToEventObject<ToEvents<E, A>> = ToEventObject<
      ToEvents<E, A>
    >,
    L = typeof resolveNode<E, A, Pc, Tc, T, Eo>,
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
  ) => {
    const out = helper(legacy, events, actorsMap, config, options);
    return out;
  },

  start: _partialCall(START_ORDERED_FNS),
  next: _partialCall(NEXT_ORDERED_FNS),
  pause: _partialCall(PAUSE_ORDERED_FNS),
  resume: _partialCall(RESUME_ORDERED_FNS),
  stop: _partialCall(STOP_ORDERED_FNS),
};

type TT = keyof typeof REGISTRY_FNS;
