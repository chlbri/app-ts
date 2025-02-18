import { isDefined, toArray } from '@bemedev/basifun';
import { t, type NOmit } from '@bemedev/types';
import cloneDeep from 'clone-deep';
import type { Action } from '~actions';
import { DEFAULT_DELIMITER } from '~constants';
import type { Delay } from '~delays';
import type { EventsMap, ToEvents } from '~events';
import {
  isDefinedS,
  isNotDefinedS,
  isNotValue,
  isValue,
  type DefinedValue,
  type PredicateS,
} from '~guards';
import type { PromiseFunction } from '~promises';
import {
  flatMap,
  initialNode,
  isAtomic,
  isCompound,
  nodeToValue,
  recomposeNode,
  valueToNode,
  type FlatMapN,
  type NodeConfig,
  type NodeConfigWithInitials,
  type StateValue,
} from '~states';
import type { KeyU, PrimitiveObject, RecordS } from '~types';
import { IS_TEST } from '~utils';
import { createChildS } from './functions';
import type {
  AddOptions_F,
  AnyMachine,
  Elements,
  GetIO2_F,
  GetIO_F,
} from './machine.types';
import type {
  Config,
  ContextFrom,
  GetEventsFromConfig,
  InitialsFromConfig,
  MachineOptions,
  PrivateContextFrom,
  SimpleMachineOptions2,
  Subscriber,
} from './types';

class Machine<
  const C extends Config = Config,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  E extends GetEventsFromConfig<C> = GetEventsFromConfig<C>,
  Mo extends SimpleMachineOptions2 = MachineOptions<C, E, Pc, Tc>,
> implements AnyMachine<E, Pc, Tc>
{
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
    return t.unknown<Mo>();
  }

  /**
   * @deprecated
   * Just use for typing
   */
  get events() {
    return t.unknown<ToEvents<E>>();
  }

  /**
   * @deprecated
   * Just use for typing
   */
  get action() {
    return t.unknown<Action<E, Pc, Tc>>();
  }

  /**
   * @deprecated
   * Just use for typing
   */
  get actionParams() {
    return t.unknown<{ pContext: Pc; context: Tc; map: E }>();
  }

  /**
   * @deprecated
   * Just use for typing
   */
  get guard() {
    return t.unknown<PredicateS<E, Pc, Tc>>();
  }

  /**
   * @deprecated
   * Just use for typing
   */
  get delay() {
    return t.unknown<Delay<E, Pc, Tc>>();
  }

  /**
   * @deprecated
   * Just use for typing
   */
  get promise() {
    return t.unknown<PromiseFunction<E, Pc, Tc>>();
  }

  /**
   * @deprecated
   * Just use for typing
   */
  get machine() {
    return t.unknown<this>();
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
    this.#initialConfig = initialNode(this.#postConfig);

    this.#getInitialKeys();

    return this.#postConfig;
  };

  #getInitialKeys = () => {
    const postConfig = this.#postConfig as NodeConfig;
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
    return (this.#actions = actions);
  };

  /**
   * @deprecated
   * Just use for testing
   */
  provideActions = (actions?: Mo['actions']) => {
    if (IS_TEST) return this.#renew('actions', actions);
    return console.error('Only renew in test env');
  };

  addPredicates = (predicates?: Mo['predicates']) =>
    (this.#predicates = predicates);

  /**
   * @deprecated
   * Just use for testing
   */
  providePredicates = (guards?: Mo['predicates']) => {
    if (IS_TEST) return this.#renew('guards', guards);
    return console.error('Only renew in test env');
  };

  addDelays = (delays?: Mo['delays']) => (this.#delays = delays);

  /**
   * @deprecated
   * Just use for testing
   */
  provideDelays = (delays?: Mo['delays']) => {
    if (IS_TEST) return this.#renew('delays', delays);
    return console.error('Only renew in test env');
  };

  addPromises = (promises?: Mo['promises']) => (this.#promises = promises);

  /**
   * @deprecated
   * Just use for testing
   */
  providePromises = (promises?: Mo['promises']) => {
    if (IS_TEST) return this.#renew('promises', promises);
    return console.error('Only renew in test env');
  };

  addMachines = (machines?: Mo['machines']) => (this.#machines = machines);

  /**
   * @deprecated
   * Just use for testing
   */
  provideMachines = (machines?: Mo['machines']) => {
    if (IS_TEST) return this.#renew('machines', machines);
    return console.error('Only renew in test env');
  };

  provideOptions = (
    options?: NOmit<Mo, 'initials'>,
  ): Machine<C, Pc, Tc, E, Mo> | void => {
    if (IS_TEST) {
      const out = this.#renew('actions', options?.actions);

      out.addPredicates(options?.predicates);
      out.addDelays(options?.delays);
      out.addPromises(options?.promises);
      out.addMachines(options?.machines);

      return out;
    }

    return console.error('Only renew in test env');
  };
  // #endregion

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

    out.addPredicates(guards);
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

  addPrivateContext = (pContext: Pc) => {
    this.#pContext = pContext;
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

  addContext = (context: Tc) => {
    this.#context = context;
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

  valueToConfig = (from: StateValue) => {
    const config = this.#postConfig;
    const check = isDefined(config);

    if (check) return valueToNode(config, from);

    this.#addError('The machine is not configured');
    return t.notUndefined(config);
  };

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
    return this.#errorsCollector.add(error);
  };

  get options() {
    const guards = this.#predicates;
    const actions = this.#actions;
    const delays = this.#delays;
    const promises = this.#promises;
    const machines = this.#machines;

    return { guards, actions, delays, promises, machines };
  }

  #createChildS = <
    const T extends KeyU<'preConfig' | 'context' | 'pContext'> = KeyU<
      'preConfig' | 'context' | 'pContext'
    >,
  >(
    machine: T,
    initials: {
      pContext: PrivateContextFrom<T>;
      context: ContextFrom<T>;
    },
    ...subscribers: Subscriber<E, Tc, T>[]
  ) => createChildS<E, Tc, T>(machine, initials, ...subscribers);

  #isValue = (path: DefinedValue<E, Pc, Tc>, ...values: any[]) => {
    return isValue<E, Pc, Tc>(path, ...values);
  };

  #isNotValue = (path: DefinedValue<E, Pc, Tc>, ...values: any[]) => {
    return isNotValue<E, Pc, Tc>(path, ...values);
  };

  #isDefined = (path: DefinedValue<E, Pc, Tc>) => {
    return isDefinedS<E, Pc, Tc>(path);
  };

  #isNotDefined = (path: DefinedValue<E, Pc, Tc>) => {
    return isNotDefinedS<E, Pc, Tc>(path);
  };

  addOptions: AddOptions_F<E, Pc, Tc, NOmit<Mo, 'initials'>> = func => {
    const isValue = this.#isValue;
    const isNotValue = this.#isNotValue;
    const isDefined = this.#isDefined;
    const isNotDefined = this.#isNotDefined;
    const createChild = this.#createChildS;

    const out = func({
      isValue,
      isNotValue,
      isDefined,
      isNotDefined,
      createChild,
    });

    this.addActions(out?.actions);
    this.addPredicates(out?.predicates);
    this.addDelays(out?.delays);
    this.addPromises(out?.promises);
    this.addMachines(out?.machines);
  };
}

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

type CreateMachine_F = <
  const C extends Config = Config,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  EventM extends GetEventsFromConfig<C> = GetEventsFromConfig<C>,
>(
  config: C,
  types: { pContext: Pc; context: Tc; eventsMap: EventM },
  initials: InitialsFromConfig<C>,
) => Machine<C, Pc, Tc, EventM>;

export const createMachine: CreateMachine_F = (
  config,
  { eventsMap, pContext, context },
  initials,
) => {
  const out = new Machine(config)
    .provideInitials(initials)
    .provideEvents(eventsMap)
    .providePrivateContext(pContext)
    .provideContext(context);

  return out;
};

export const DEFAULT_MACHINE: AnyMachine = new Machine({
  states: {},
});
