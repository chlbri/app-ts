import { isDefined, partialCall, toArray } from '@bemedev/basifun';
import { t, type NOmit } from '@bemedev/types';
import cloneDeep from 'clone-deep';
import type { Action } from '~actions';
import { DEFAULT_DELIMITER } from '~constants';
import type { Delay } from '~delays';
import type { EventsMap, PromiseeMap, ToEvents } from '~events';
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
  initialConfig,
  isAtomic,
  isCompound,
  nodeToValue,
  recomposeConfig,
  valueToNode,
  type FlatMapN,
  type NodeConfig,
  type NodeConfigWithInitials,
  type StateValue,
} from '~states';
import type { PrimitiveObject, RecordS } from '~types';
import { merge } from '~utils';
import { createChildS, type CreateChild_F } from './functions/create';
import type {
  AddOption_F,
  AddOptions_F,
  AnyMachine,
  Elements,
  GetIO_F,
} from './machine.types';
import type {
  Config,
  GetEventsFromConfig,
  GetPromiseeSrcFromConfig,
  InitialsFromConfig,
  MachineOptions,
  SimpleMachineOptions2,
} from './types';

class Machine<
  const C extends Config = Config,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  E extends GetEventsFromConfig<C> = GetEventsFromConfig<C>,
  P extends PromiseeMap = GetPromiseeSrcFromConfig<C>,
  Mo extends SimpleMachineOptions2 = MachineOptions<C, E, P, Pc, Tc>,
> implements AnyMachine<E, P, Pc, Tc>
{
  #config: C;
  #flat: FlatMapN<C, true>;
  #eventsMap!: E;
  #promiseesMap!: P;

  get eventsMap() {
    return this.#eventsMap;
  }

  get promiseesMap() {
    return this.#promiseesMap;
  }

  // #region Types
  /**
   * @deprecated
   * Just use for typing
   */
  get mo() {
    return t.unknown<Required<Mo>>();
  }

  /**
   * @deprecated
   * Just use for typing
   */
  get events() {
    return t.unknown<ToEvents<E, P>>();
  }

  /**
   * @deprecated
   * Just use for typing
   */
  get action() {
    return t.unknown<Action<E, P, Pc, Tc>>();
  }

  /**
   * @deprecated
   * Just use for typing
   */
  get actionKey() {
    return t.unknown<keyof (typeof this)['mo']['actions']>();
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
    return t.unknown<keyof (typeof this)['mo']['predicates']>();
  }

  /**
   * @deprecated
   * Just use for typing
   */
  get predictate() {
    return t.unknown<PredicateS<E, P, Pc, Tc>>();
  }

  /**
   * @deprecated
   * Just use for typing
   */
  get delayKey() {
    return t.unknown<keyof (typeof this)['mo']['delays']>();
  }

  /**
   * @deprecated
   * Just use for typing
   */
  get delay() {
    return t.unknown<Delay<E, P, Pc, Tc>>();
  }

  /**
   * @deprecated
   * Just use for typing
   */
  get definedValue() {
    return t.unknown<DefinedValue<Pc, Tc>>();
  }

  /**
   * @deprecated
   * Just use for typing
   */
  get src() {
    return t.unknown<keyof (typeof this)['mo']['promises']>();
  }

  /**
   * @deprecated
   * Just use for typing
   */
  get promise() {
    return t.unknown<PromiseFunction<E, P, Pc, Tc>>();
  }

  /**
   * @deprecated
   * Just use for typing
   */
  get child() {
    return t.unknown<keyof (typeof this)['mo']['machines']>();
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
  #postflat!: RecordS<NodeConfigWithInitials>;

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

  get postflat() {
    return this.#postflat;
  }

  // #region Providers
  addInitials = (initials: Mo['initials']) => {
    this.#initials = initials;
    const entries = Object.entries(this.#initials);
    const flat: any = structuredClone(this.#flat);
    entries.forEach(([key, initial]) => {
      flat[key] = { ...flat[key], initial };
    });

    this.#postConfig = recomposeConfig(flat);
    this.#initialConfig = initialConfig(this.#postConfig);

    this.#getInitialKeys();

    return this.#postConfig;
  };

  #getInitialKeys = () => {
    const postConfig = this.#postConfig as NodeConfig;
    this.#postflat = flatMap(postConfig) as any;

    const entries = Object.entries(this.#postflat);
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

      if (check2) return this.retrieveParentFromInitial.bind(this)(parent);
      return this.#postflat[parent];
    }
    return this.#postflat[target];
  };

  provideInitials = (initials: Mo['initials']) =>
    this.#renew('initials', initials);

  #addActions = (actions?: Mo['actions']) =>
    (this.#actions = merge(this.#actions, actions));

  #addPredicates = (predicates?: Mo['predicates']) =>
    (this.#predicates = merge(this.#predicates, predicates));

  #addDelays = (delays?: Mo['delays']) =>
    (this.#delays = merge(this.#delays, delays));

  #addPromises = (promises?: Mo['promises']) =>
    (this.#promises = merge(this.#promises, promises));

  #addMachines = (machines?: Mo['machines']) =>
    (this.#machines = merge(this.#machines, machines));

  provideOptions = (
    option: AddOption_F<E, P, Pc, Tc, NOmit<Mo, 'initials'>>,
  ) => {
    const out = this.renew;
    out.addOptions(option);

    return out;
  };
  // #endregion

  get #elements(): Elements<C, E, P, Pc, Tc, Mo> {
    const config = structuredClone(this.#config);
    const initials = structuredClone(this.#initials);
    const pContext = cloneDeep(this.#pContext);
    const context = structuredClone(this.#context);
    const actions = cloneDeep(this.#actions);
    const predicates = cloneDeep(this.#predicates);
    const delays = cloneDeep(this.#delays);
    const promises = cloneDeep(this.#promises);
    const machines = cloneDeep(this.#machines);
    const events = cloneDeep(this.#eventsMap);
    const promisees = cloneDeep(this.#promiseesMap);

    return {
      config,
      initials,
      pContext,
      context,
      actions,
      predicates,
      delays,
      promises,
      machines,
      events,
      promisees,
    };
  }

  #provideElements = <T extends keyof Elements>(
    key?: T,
    value?: Elements<C, E, P, Pc, Tc, Mo>[T],
  ): Elements<C, E, P, Pc, Tc, Mo> => {
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
    value?: Elements<C, E, P, Pc, Tc, Mo>[T],
  ): Machine<C, Pc, Tc, E, P, Mo> => {
    const {
      config,
      initials,
      pContext,
      context,
      predicates,
      actions,
      delays,
      promises,
      machines,
      promisees,
      events,
    } = this.#provideElements(key, value);

    const out = new Machine<C, Pc, Tc, E, P, Mo>(config);
    out.addInitials(initials);

    out.#pContext = pContext;
    out.#context = context;
    out.#eventsMap = events;
    out.#promiseesMap = promisees;

    out.#addPredicates(predicates);
    out.#addActions(actions);
    out.#addDelays(delays);
    out.#addPromises(promises);
    out.#addMachines(machines);

    return out;
  };

  get renew() {
    return this.#renew();
  }

  /**
   * Reset all options
   */

  providePrivateContext = <T>(pContext: T) => {
    const { context, initials, config, events, promisees } =
      this.#elements;

    const out = new Machine<C, T, Tc, E, P>(config);

    out.addInitials(initials);
    out.#context = context;
    out.#pContext = pContext;
    out.#eventsMap = events;
    out.#promiseesMap = promisees;

    return out;
  };

  addPrivateContext = (pContext: Pc) => {
    this.#pContext = pContext;
  };

  /**
   * Reset all options
   */
  provideContext = <T extends PrimitiveObject>(context: T) => {
    const { pContext, initials, config, events, promisees } =
      this.#elements;

    const out = new Machine<C, Pc, T, E, P>(config);

    out.addInitials(initials);
    out.#pContext = pContext;
    out.#context = context;
    out.#eventsMap = events;
    out.#promiseesMap = promisees;

    return out;
  };

  addContext = (context: Tc) => {
    this.#context = context;
  };

  /**
   * Reset all options
   */

  provideEvents = <T extends EventsMap>(map: T) => {
    const { pContext, initials, config, context, promisees } =
      this.#elements;

    const out = new Machine<C, Pc, Tc, T, P>(config);

    out.addInitials(initials);
    out.#pContext = pContext;
    out.#context = context;
    out.#eventsMap = map;
    out.#promiseesMap = promisees;

    return out;
  };

  providePromisees = <T extends PromiseeMap>(map: T) => {
    const { pContext, initials, config, context, events } = this.#elements;

    const out = new Machine<C, Pc, Tc, E, T>(config);

    out.addInitials(initials);
    out.#pContext = pContext;
    out.#context = context;
    out.#eventsMap = events;
    out.#promiseesMap = map;

    return out;
  };

  valueToConfig = (from: StateValue) => {
    return valueToNode(this.#postConfig, from);
  };

  get initialConfig() {
    return this.#initialConfig;
  }

  get initialValue() {
    return nodeToValue(this.#initialConfig);
  }

  toNode = this.valueToConfig;

  get options() {
    const guards = this.#predicates;
    const actions = this.#actions;
    const delays = this.#delays;
    const promises = this.#promises;
    const machines = this.#machines;

    return { guards, actions, delays, promises, machines };
  }

  get #isValue() {
    return isValue<E, P, Pc, Tc>;
  }

  get #isNotValue() {
    return isNotValue<E, P, Pc, Tc>;
  }

  get #isDefined() {
    return isDefinedS<E, P, Pc, Tc>;
  }

  get #isNotDefined() {
    return isNotDefinedS<E, P, Pc, Tc>;
  }

  createChild: CreateChild_F<E, P, Tc> = (...args) => {
    return createChildS(...args);
  };

  addOptions: AddOptions_F<E, P, Pc, Tc, NOmit<Mo, 'initials'>> = func => {
    const isValue = this.#isValue;
    const isNotValue = this.#isNotValue;
    const isDefined = this.#isDefined;
    const isNotDefined = this.#isNotDefined;
    const createChild = this.createChild;

    const out = func({
      isValue,
      isNotValue,
      isDefined,
      isNotDefined,
      createChild,
    });

    this.#addActions(out?.actions);
    this.#addPredicates(out?.predicates);
    this.#addDelays(out?.delays);
    this.#addPromises(out?.promises);
    this.#addMachines(out?.machines);
  };
}

const getIO: GetIO_F = (key, node) => {
  const out = toArray.typed(node?.[key]);

  if (isAtomic(node)) {
    return out;
  }

  if (isCompound(node)) {
    const initial = node.states[node.initial];

    out.push(...getIO(key, initial));
  } else {
    const values = Object.values(node.states);

    values.forEach(node1 => {
      out.push(...getIO(key, node1));
    });
  }

  return out;
};

export const getEntries = partialCall(getIO, 'entry');
export const getExits = partialCall(getIO, 'exit');

export type { Machine };

type CreateMachine_F = <
  const C extends Config = Config,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  EventM extends GetEventsFromConfig<C> = GetEventsFromConfig<C>,
  P extends PromiseeMap = GetPromiseeSrcFromConfig<C>,
>(
  config: C,
  types: { pContext: Pc; context: Tc; eventsMap: EventM; promiseesMap: P },
  initials: InitialsFromConfig<C>,
) => Machine<C, Pc, Tc, EventM, P>;

export const createMachine: CreateMachine_F = (
  config,
  { eventsMap, pContext, context, promiseesMap },
  initials,
) => {
  const out = new Machine(config)
    .provideInitials(initials)
    .provideEvents(eventsMap)
    .providePrivateContext(pContext)
    .provideContext(context)
    .providePromisees(promiseesMap);

  return out;
};

export const DEFAULT_MACHINE: AnyMachine = new Machine({
  states: {},
});
