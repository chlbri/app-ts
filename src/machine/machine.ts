import { isDefined, toArray } from '@bemedev/basifun';
import { t, type NOmit } from '@bemedev/types';
import cloneDeep from 'clone-deep';
import { DEFAULT_DELIMITER } from '~constants';
import type { EventsMap, ToEvents } from '~events';
import { type StateValue } from '~states';
import type { PrimitiveObject } from '~types';
import { flatMap } from './flatMap';
import { getInitialNodeConfig } from './getInitialNodeConfig';
import { stateType } from './getStateType';
import type { Elements, GetIO2_F, GetIO_F } from './machine.types';
import { nodeToValue } from './nodeToValue';
import { recomposeNode } from './recompose';
import { toSimple } from './toSimple';
import type {
  Action,
  Config,
  Delay,
  FlatMapN,
  MachineOptions,
  NodeConfig,
  NodeConfigAtomic,
  NodeConfigCompoundWithInitials,
  NodeConfigParallelWithInitials,
  NodeConfigWithInitials,
  PredicateS,
  PromiseFunction,
  RecordS,
  SimpleMachineOptions2,
} from './types';
import { valueToConfig } from './valueToNode';

class Machine<
  const C extends Config = Config,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  E extends EventsMap = EventsMap,
  Mo extends SimpleMachineOptions2 = MachineOptions<C, E, Pc, Tc>,
> {
  #config: C;
  #flat: FlatMapN<C, true>;
  #eventsMap!: E;

  get eventsMap() {
    return this.#eventsMap;
  }

  // #region Types
  /**
   * @deprecated
   * Just use for typing
   */
  get mo() {
    return t.anify<Mo>();
  }

  /**
   * @deprecated
   * Just use for typing
   */
  get events() {
    return t.anify<ToEvents<E>>();
  }

  /**
   * @deprecated
   * Just use for typing
   */
  get action() {
    return t.anify<Action<E, Pc, Tc>>();
  }

  /**
   * @deprecated
   * Just use for typing
   */
  get actionParams() {
    return t.anify<{ pContext: Pc; context: Tc; map: E }>();
  }

  /**
   * @deprecated
   * Just use for typing
   */
  get guard() {
    return t.anify<PredicateS<E, Pc, Tc>>();
  }

  /**
   * @deprecated
   * Just use for typing
   */
  get delay() {
    return t.anify<Delay<E, Pc, Tc>>();
  }

  /**
   * @deprecated
   * Just use for typing
   */
  get promise() {
    return t.anify<PromiseFunction<E, Pc, Tc>>();
  }

  /**
   * @deprecated
   * Just use for typing
   */
  get machine() {
    return t.anify<this>();
  }
  // #endregion

  // #region private
  #actions?: Mo['actions'];

  #predicates?: Mo['predicates'];

  #delays?: Mo['delays'];

  #promises?: Mo['promises'];

  #machines?: Mo['machines'];

  #initials!: Mo['initials'];

  #context!: Tc;

  #pContext!: Pc;

  #postConfig!: NodeConfigWithInitials;
  #postFlat!: RecordS<NodeConfigWithInitials>;

  #initialKeys: string[] = [];

  #initialConfig!: NodeConfigWithInitials;
  // #endregion

  constructor(config: C) {
    this.#config = config;
    this.#flat = flatMap<C, true>(config);
  }

  get preConfig() {
    return this.#config;
  }

  get preflat() {
    return this.#flat;
  }

  /**
   * Use after providing initials
   */
  get postConfig() {
    return this.#postConfig!;
  }

  get initials() {
    return this.#initials;
  }

  get context() {
    const out = this.#elements.context;
    return out;
  }

  get pContext() {
    const out = this.#elements.pContext;
    return out;
  }

  get actions() {
    return this.#actions;
  }

  get predicates() {
    return this.#predicates;
  }

  get delays() {
    return this.#delays;
  }

  get promises() {
    return this.#promises;
  }

  get machines() {
    return this.#machines;
  }

  get postFlat() {
    return this.#postFlat;
  }

  // #region Providers
  addInitials = (initials: Mo['initials']) => {
    this.#initials = initials;
    const entries = Object.entries(this.#initials);
    const flat: any = structuredClone(this.#flat);
    entries.forEach(([key, initial]) => {
      flat[key] = { ...flat[key], initial };
    });

    this.#postConfig = recomposeNode(flat);
    this.#initialConfig = getInitialNodeConfig(this.#postConfig);

    this.#getInitialKeys();

    return this.#postConfig;
  };

  #getInitialKeys = () => {
    const postConfig = this.#postConfig as unknown as NodeConfig;
    this.#postFlat = flatMap(postConfig) as any;

    const entries = Object.entries(this.#postFlat);
    entries.forEach(([key, { initial }]) => {
      const check1 = initial !== undefined;
      if (check1) {
        const toPush = `${key}${DEFAULT_DELIMITER}${initial}`;
        this.#initialKeys.push(toPush);
      }
    });
  };

  isInitial = (target: string) => {
    return this.#initialKeys.includes(target);
  };

  retrieveParentFromInitial = (target: string): NodeConfigWithInitials => {
    const check1 = this.isInitial(target);
    if (check1) {
      const parent = target.substring(
        0,
        target.lastIndexOf(DEFAULT_DELIMITER),
      );
      const check2 = this.isInitial(parent);

      if (check2) return this.retrieveParentFromInitial(parent);
      return this.#postFlat[parent];
    }
    return this.#postFlat[target];
  };

  provideInitials = (initials: Mo['initials']) =>
    this.#renew('initials', initials);

  addActions = (actions?: Mo['actions']) => {
    this.#actions = actions;
  };

  provideActions = (actions?: Mo['actions']) =>
    this.#renew('actions', actions);

  addGuards = (guards?: Mo['predicates']) => (this.#predicates = guards);

  provideGuards = (guards?: Mo['predicates']) =>
    this.#renew('guards', guards);

  addDelays = (delays?: Mo['delays']) => (this.#delays = delays);

  provideDelays = (delays?: Mo['delays']) => this.#renew('delays', delays);

  addPromises = (promises?: Mo['promises']) => (this.#promises = promises);

  providePromises = (promises?: Mo['promises']) =>
    this.#renew('promises', promises);

  addMachines = (machines?: Mo['machines']) => (this.#machines = machines);

  provideMachines = (machines?: Mo['machines']) =>
    this.#renew('machines', machines);

  addOptions = (options?: NOmit<Mo, 'initials'>) => {
    this.addActions(options?.actions);
    this.addGuards(options?.predicates);
    this.addDelays(options?.delays);
    this.addPromises(options?.promises);
    this.addMachines(options?.machines);
  };

  provideOptions = (
    options?: NOmit<Mo, 'initials'>,
  ): Machine<C, Pc, Tc, E, Mo> => {
    const out = this.#renew('actions', options?.actions);

    out.addGuards(options?.predicates);
    out.addDelays(options?.delays);
    out.addPromises(options?.promises);
    out.addMachines(options?.machines);

    return out;
  };
  // #endregion

  start = () => {};

  get #elements(): Elements<C, E, Pc, Tc, Mo> {
    const config = structuredClone(this.#config);
    const initials = structuredClone(this.#initials);
    const pContext = cloneDeep(this.#pContext);
    const context = structuredClone(this.#context);
    const actions = cloneDeep(this.#actions);
    const guards = cloneDeep(this.#predicates);
    const delays = cloneDeep(this.#delays);
    const promises = cloneDeep(this.#promises);
    const machines = cloneDeep(this.#machines);
    const events = cloneDeep(this.#eventsMap);

    return {
      config,
      initials,
      pContext,
      context,
      actions,
      guards,
      delays,
      promises,
      machines,
      events,
    };
  }

  #provideElements = <T extends keyof Elements>(
    key?: T,
    value?: Elements<C, E, Pc, Tc, Mo>[T],
  ): Elements<C, E, Pc, Tc, Mo> => {
    const out = this.#elements;
    const check = isDefined(key);

    return check
      ? {
          ...out,
          [key]: value,
        }
      : out;
  };

  #renew = <T extends keyof Elements>(
    key?: T,
    value?: Elements<C, E, Pc, Tc, Mo>[T],
  ): Machine<C, Pc, Tc, E, Mo> => {
    const {
      config,
      initials,
      pContext,
      context,
      guards,
      actions,
      delays,
      promises,
      machines,
      events,
    } = this.#provideElements(key, value);

    const out = new Machine<C, Pc, Tc, E, Mo>(config);
    const check1 = isDefined(initials);
    if (check1) out.addInitials(initials);

    out.#pContext = pContext;
    out.#context = context;
    out.#eventsMap = events;

    out.addGuards(guards);
    out.addActions(actions);
    out.addDelays(delays);
    out.addPromises(promises);
    out.addMachines(machines);

    return out;
  };

  get renew() {
    return this.#renew();
  }

  /**
   * Reset all options
   */

  providePrivateContext = <T>(pContext: T) => {
    const { context, initials, config, events } = this.#elements;

    const out = new Machine<C, T, Tc, E>(config);

    const check1 = isDefined(initials);
    if (check1) out.addInitials(initials);

    out.#context = context;
    out.#pContext = pContext;
    out.#eventsMap = events;

    return out;
  };

  /**
   * Reset all options
   */
  provideContext = <T extends PrimitiveObject>(context: T) => {
    const { pContext, initials, config, events } = this.#elements;

    const out = new Machine<C, Pc, T, E>(config);
    const check1 = isDefined(initials);
    if (check1) out.addInitials(initials);

    out.#pContext = pContext;
    out.#context = context;
    out.#eventsMap = events;

    return out;
  };

  /**
   * Reset all options
   */

  provideEvents = <T extends EventsMap>(events: T) => {
    const { pContext, initials, config, context } = this.#elements;

    const out = new Machine<C, Pc, Tc, T>(config);
    const check1 = isDefined(initials);
    if (check1) out.addInitials(initials);

    out.#pContext = pContext;
    out.#context = context;
    out.#eventsMap = events;

    return out;
  };

  get simple() {
    if (this.#postConfig) return toSimple(this.#postConfig);

    this.#addError('"postConfig" is not defined');
    return t.notUndefined(this.#postConfig);
  }

  valueToConfig = (from: StateValue) => {
    const config = this.#postConfig;
    const check = isDefined(config);

    if (check) return valueToConfig(config, from);

    this.#addError('The machine is not configured');
    return t.notUndefined(config);
  };

  //TODO handle errors

  // #region TODO
  // TODO : Use It

  // #throw = () => {
  //   const check = this.#errorsCollector.size > 0;
  //   if (check) {
  //     const errors = this.errorsCollector.join('\n');
  //     const error = new Error(errors);

  //     throw error;
  //   }
  // };
  // #endregion

  get initialConfig() {
    return this.#initialConfig;
  }

  get initialValue() {
    return nodeToValue(this.initialConfig);
  }

  toNode = this.valueToConfig;

  #errorsCollector = new Set<string>();

  get errorsCollector() {
    return Array.from(this.#errorsCollector);
  }

  #addError = (error: string) => {
    this.#errorsCollector.add(error);
  };

  get options() {
    const guards = this.#predicates;
    const actions = this.#actions;
    const delays = this.#delays;
    const promises = this.#promises;
    const machines = this.#machines;

    return { guards, actions, delays, promises, machines };
  }
}

// #region Checkers
export const isAtomic = (arg: any): arg is NodeConfigAtomic => {
  return stateType(arg) === 'atomic';
};

export const isCompound = (
  arg: any,
): arg is NodeConfigCompoundWithInitials => {
  return stateType(arg) === 'compound';
};

export const isParallel = (
  arg: any,
): arg is NodeConfigParallelWithInitials => {
  return stateType(arg) === 'parallel';
};
// #endregion

export const getIO: GetIO_F = (node, key) => {
  const out = toArray<string>(node?.[key]);

  if (!node) return [];
  if (isAtomic(node)) {
    return out;
  }

  if (isCompound(node)) {
    const initial = node.states[node.initial];

    out.push(...getIO(initial, key));
  } else {
    const values = Object.values(node.states);

    values.forEach(node1 => {
      out.push(...getIO(node1, key));
    });
  }

  return out;
};

export const getEntries: GetIO2_F = node => getIO(node, 'entry');
export const getExits: GetIO2_F = node => getIO(node, 'exit');

export type { Machine };

export type AnyMachine = Machine<
  Config,
  any,
  PrimitiveObject,
  any,
  SimpleMachineOptions2
>;

type CreateMachine_F = <
  const C extends Config = Config,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  EventM extends EventsMap = EventsMap,
  Mo extends SimpleMachineOptions2 = MachineOptions<C, EventM, Pc, Tc>,
>(
  config: C,
  types: { pContext: Pc; context: Tc; eventsMap: EventM },
  initials: Mo['initials'],
  options?: NOmit<Mo, 'initials'>,
) => Machine<C, Pc, Tc, EventM, Mo>;

export const createMachine: CreateMachine_F = (
  config,
  { eventsMap, pContext, context },
  initials,
  options,
) => {
  const out1 = new Machine(config);
  out1.addInitials(initials);

  const out2 = out1
    .provideEvents(eventsMap)
    .providePrivateContext(pContext)
    .provideContext(context);
  out2.addOptions(options);

  return out2 as any;
};

export const DEFAULT_MACHINE: AnyMachine = new Machine({
  states: {},
});
