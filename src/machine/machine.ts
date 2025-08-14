import type { Action } from '#actions';
import { DEFAULT_DELIMITER } from '#constants';
import type { Delay } from '#delays';
import {
  type EventsMap,
  type PromiseeMap,
  type ToEvents,
  type ToEventsR,
} from '#events';
import {
  isDefinedS,
  isNotDefinedS,
  isNotValue,
  isValue,
  type DefinedValue,
  type PredicateS,
} from '#guards';
import type {
  State,
  StateExtended,
  StateP,
  StatePextended,
} from '#interpreters';
import { type PromiseFunction } from '#promises';
import {
  flatMap,
  initialConfig,
  isAtomic,
  isCompound,
  nodeToValue,
  valueToNode,
  type FlatMapN,
  type NodeConfig,
  type StateValue,
} from '#states';
import { merge, reduceFnMap } from '#utils';
import { partialCall, toArray } from '@bemedev/basifun';
import { decompose, type Decompose } from '@bemedev/decompose';
import { castings, typings, type types } from '@bemedev/types';
import cloneDeep from 'clone-deep';
import {
  createChildS,
  expandFnMap,
  type CreateChild_F,
} from './functions';
import type {
  AddOptions_F,
  AnyMachine,
  Elements,
  GetIO_F,
  ScheduledData,
  SendAction_F,
  TimeAction_F,
  VoidAction_F,
} from './machine.types';
import type {
  Config,
  ConfigDef,
  GetEventsFromConfig,
  GetPromiseeSrcFromConfig,
  MachineOptions,
  NoExtraKeysConfig,
  NoExtraKeysConfigDef,
  SimpleMachineOptions2,
  TransformConfigDef,
} from './types';

/**
 * A class representing a state machine.
 * It provides methods to manage states, actions, predicates, delays, promises, and machines.
 *
 * @template : {@linkcode Config} [C] - The configuration type of the machine.
 * @template Pc : The private context type of the machine.
 * @template : {@linkcode types.PrimitiveObject} [Pc] - The context type of the machine.
 * @template : {@linkcode GetEventsFromConfig}<{@linkcode C}> [E] - The events map type derived from the configuration.
 * @template : {@linkcode PromiseeMap} [P] - The promisees map type derived from the configuration. Defaults to {@linkcode GetPromiseeSrcFromConfig}<{@linkcode C}>.
 * @template : {@linkcode SimpleMachineOptions2} [Mo] - The options type for the machine, which includes actions, predicates, delays, promises, and machines. Defaults to {@linkcode MachineOptions}<[{@linkcode C} , {@linkcode E} , {@linkcode P} , {@linkcode Pc} , {@linkcode Tc} ]>.
 *
 * @implements {@linkcode AnyMachine}<{@linkcode E} , {@linkcode P} , {@linkcode Pc} , {@linkcode Tc} >
 */

class Machine<
  const C extends Config = Config,
  const Pc = any,
  const Tc extends types.PrimitiveObject = types.PrimitiveObject,
  E extends GetEventsFromConfig<C> = GetEventsFromConfig<C>,
  P extends PromiseeMap = GetPromiseeSrcFromConfig<C>,
  Mo extends SimpleMachineOptions2 = MachineOptions<C, E, P, Pc, Tc>,
> implements AnyMachine<E, P, Pc, Tc>
{
  /**
   * The configuration of the machine for this {@linkcode Machine}.
   *
   * @see {@linkcode Config}
   * @see {@linkcode C}
   */
  #config: C;

  /**
   * The flat map of the configuration for this {@linkcode Machine}.
   *
   * @see {@linkcode FlatMapN}
   * @see {@linkcode Config}
   * @see {@linkcode C}
   */
  #flat: FlatMapN<C, true>;

  #decomposed: Decompose<C, { sep: '.'; start: false; object: 'both' }>;

  get decomposed() {
    return this.#decomposed;
  }

  /**
   * The map of events for this {@linkcode Machine}.
   *
   * @see {@linkcode EventsMap}
   * @see {@linkcode E}
   */
  #eventsMap!: E;

  /**
   * The map of promisees for this {@linkcode Machine}.
   *
   * @see {@linkcode PromiseeMap}
   * @see {@linkcode P}
   */
  #promiseesMap!: P;

  /**
   * Public accessor for the events map for this {@linkcode Machine}.
   *
   * @see {@linkcode EventsMap}
   * @see {@linkcode E}   */
  get eventsMap() {
    return this.#eventsMap;
  }

  /**
   * Public accessor for the promisees map for this {@linkcode Machine}.
   *
   * @see {@linkcode PromiseeMap}
   * @see {@linkcode P}
   */
  get promiseesMap() {
    return this.#promiseesMap;
  }

  /**
   * @deprecated
   *
   * This property provides the events map for this {@linkcode Machine} as a type.
   *
   * @see {@linkcode ToEvents}
   * @see {@linkcode E}
   * @see {@linkcode P}
   *
   * @remarks Used for typing purposes only.
   */
  get __events() {
    return typings.commons<ToEvents<E, P>>();
  }

  /**
   * @deprecated
   * This property provides the action function for this {@linkcode Machine} as a type.
   *
   * @remarks Used for typing purposes only.
   *
   * @see {@linkcode ToEvents}
   * @see {@linkcode E}
   * @see {@linkcode PromiseeMap}
   * @see {@linkcode P}
   * @see {@linkcode Pc}
   * @see {@linkcode types.PrimitiveObject}
   * @see {@linkcode Tc}
   */
  get __actionFn() {
    return typings.commons<Action<E, P, Pc, Tc>>();
  }

  /**
   * @deprecated
   *
   * This property provides any action key for this {@linkcode Machine} as a type.
   *
   * @remarks Used for typing purposes only.
   */
  get __actionKey() {
    return this.#typingsByKey('actions');
  }

  /**
   * @deprecated
   *
   * This property provides the action parameters of action function for this {@linkcode Machine} as a type.
   *
   * @remarks Used for typing purposes only.
   *
   * @see {@linkcode ToEvents}
   * @see {@linkcode E}
   * @see {@linkcode Pc}
   * @see {@linkcode types.PrimitiveObject}
   * @see {@linkcode Tc}
   */
  get __actionParams() {
    return typings.commons<{ pContext: Pc; context: Tc; map: E }>();
  }

  /**
   * @deprecated
   *
   * This property provides the state extended for this {@linkcode Machine} as a type.
   *
   * @remarks Used for typing purposes only.
   *
   * @see {@linkcode StateExtended}
   * @see {@linkcode ToEvents}
   * @see {@linkcode E}
   * @see {@linkcode types.PrimitiveObject}
   * @see {@linkcode Pc}
   * @see {@linkcode Tc}
   */
  get __stateExtended() {
    return typings.commons<StateExtended<Pc, Tc, ToEvents<E, P>>>();
  }

  /**
   * @deprecated
   *
   * This property provides the state for this {@linkcode Machine} as a type.
   *
   * @remarks Used for typing purposes only.
   *
   * @see {@linkcode State}
   * @see {@linkcode ToEvents}
   * @see {@linkcode E}
   * @see {@linkcode types.PrimitiveObject}
   * @see {@linkcode Pc}
   * @see {@linkcode Tc}
   */
  get __state() {
    return typings.commons<State<Tc, ToEventsR<E, P>>>();
  }

  /**
   * @deprecated
   *
   * This property provides the state payload for this {@linkcode Machine} as a type.
   *
   * @remarks Used for typing purposes only.
   *
   * @see {@linkcode StateP}
   * @see {@linkcode ToEvents}
   * @see {@linkcode E}
   * @see {@linkcode types.PrimitiveObject}
   * @see {@linkcode Pc}
   * @see {@linkcode Tc}
   */
  get __stateP() {
    return typings.commons<StateP<Tc, ToEventsR<E, P>['payload']>>();
  }

  /**
   * @deprecated
   *
   * This property provides the extended state payload for this {@linkcode Machine} as a type.
   *
   * @remarks Used for typing purposes only.
   *
   * @see {@linkcode StatePextended}
   * @see {@linkcode ToEvents}
   * @see {@linkcode E}
   * @see {@linkcode types.PrimitiveObject}
   * @see {@linkcode Pc}
   * @see {@linkcode Tc}
   */
  get __statePextended() {
    return typings.commons<
      StatePextended<Pc, Tc, ToEventsR<E, P>['payload']>
    >();
  }

  #typingsByKey = <
    K extends types.AllowedNames<
      AnyMachine<E, P, Pc, Tc>,
      object | undefined
    >,
  >(
    key: K,
  ) => {
    const _this = typings.objects.dynamic(this);
    const out1 = typings.objects.byKey(_this, key);
    const out2 = typings.commons.extract(out1, typings.objects.type);
    const out3 = typings.objects.keysOf.union(out2);

    return out3;
  };

  /**
   * @deprecated
   *
   * This property provides any guard key for this {@linkcode Machine} as a type.
   *
   * @remarks Used for typing purposes only.
   */
  get __guardKey() {
    return this.#typingsByKey('predicates');
  }

  /**
   * @deprecated
   *
   * This property provides the predicate function for this {@linkcode Machine} as a type.
   *
   * @remarks Used for typing purposes only.
   *
   * @see {@linkcode PredicateS}
   * @see {@linkcode ToEvents}
   * @see {@linkcode E}
   * @see {@linkcode PromiseeMap}
   * @see {@linkcode P}
   * @see {@linkcode Pc}
   * @see {@linkcode types.PrimitiveObject}
   * @see {@linkcode Tc}
   */
  get __predictate() {
    return typings.commons<PredicateS<E, P, Pc, Tc>>();
  }

  /**
   * @deprecated
   *
   * This property provides any delay key for this {@linkcode Machine} as a type.
   *
   * @remarks Used for typing purposes only.
   */
  get __delayKey() {
    return this.#typingsByKey('delays');
  }

  /**
   * @deprecated
   *
   * This property provides the delay function for this {@linkcode Machine} as a type.
   *
   * @remarks Used for typing purposes only.
   *
   * @see {@linkcode Delay}
   * @see {@linkcode ToEvents}
   * @see {@linkcode E}
   * @see {@linkcode PromiseeMap}
   * @see {@linkcode P}
   * @see {@linkcode Pc}
   * @see {@linkcode types.PrimitiveObject}
   * @see {@linkcode Tc}
   */
  get __delay() {
    return typings.commons<Delay<E, P, Pc, Tc>>();
  }

  /**
   * @deprecated
   *
   * This property provides any {@linkcode DefinedValue} for this {@linkcode Machine} as a type.
   *
   * @remarks Used for typing purposes only.
   *
   * @see {@linkcode DefinedValue}
   * @see {@linkcode Pc}
   * @see {@linkcode types.PrimitiveObject}
   * @see {@linkcode Tc}
   */
  get __definedValue() {
    return typings.commons<DefinedValue<Pc, Tc>>();
  }

  /**
   * @deprecated
   *
   * This property provides any promise key for this {@linkcode Machine} as a type.
   *
   * @remarks Used for typing purposes only.
   */
  get __src() {
    return this.#typingsByKey('promises');
  }

  /**
   * @deprecated
   *
   * This property provides the promise function for this {@linkcode Machine} as a type.
   *
   * @remarks Used for typing purposes only.
   *
   * @see {@linkcode PromiseFunction}
   * @see {@linkcode ToEvents}
   * @see {@linkcode E}
   * @see {@linkcode PromiseeMap}
   * @see {@linkcode P}
   * @see {@linkcode Pc}
   * @see {@linkcode types.PrimitiveObject}
   * @see {@linkcode Tc}
   */
  get __promise() {
    return typings.commons<PromiseFunction<E, P, Pc, Tc>>();
  }

  /**
   * @deprecated
   *
   * This property provides any machine key for this {@linkcode Machine} as a type.
   *
   * @remarks Used for typing purposes only.
   */
  get __childKey() {
    return this.#typingsByKey('machines');
  }

  /**
   * @deprecated
   *
   * Return this {@linkcode Machine} as a type.
   *
   * @remarks Used for typing purposes only.
   */
  get __machine() {
    return typings.commons<this>();
  }
  // #endregion

  // #region private
  #actions?: Mo['actions'];

  #predicates?: Mo['predicates'];

  #delays?: Mo['delays'];

  #promises?: Mo['promises'];

  #machines?: Mo['machines'];

  /**
   * Initials {@linkcode StateValue}s for all compound {@linkcode NodeConfigWithInitials}.
   */

  /**
   * Context for this {@linkcode Machine}.
   *
   * @see {@linkcode types.PrimitiveObject}
   * @see {@linkcode Tc}
   */
  #context!: Tc;

  /**
   * Private context for this {@linkcode Machine}.
   *
   * @see {@linkcode Pc}
   */
  #pContext!: Pc;

  #initialKeys: string[] = [];

  /**
   * The initial node config of this {@linkcode Machine}.
   */
  #initialConfig: NodeConfig;
  // #endregion

  /**
   * Creates an instance of Machine.
   *
   * @param config : of type {@linkcode Config} [C] - The configuration for the machine.
   *
   * @remarks
   * This constructor initializes the machine with the provided configuration.
   * It flattens the configuration and prepares it for further operations ({@linkcode flat}).
   */
  constructor(config: C) {
    this.#config = config;
    this.#decomposed = decompose(config, {
      start: false,
      object: 'both',
    }) as Decompose<C, { sep: '.'; start: false; object: 'both' }>;
    this.#flat = flatMap(config, true);
    this.#initialConfig = initialConfig(this.#config);
    this.#getInitialKeys();
  }

  /**
   * The accessor configuration of the machine for this {@linkcode Machine}.
   *
   * @see {@linkcode Config}
   * @see {@linkcode C}
   */
  get config() {
    return this.#config;
  }

  /**
   * The public accessor of the flat map of the configuration for this {@linkcode Machine}.
   *
   * @see {@linkcode FlatMapN}
   * @see {@linkcode Config}
   * @see {@linkcode C}
   */
  get flat() {
    return this.#flat;
  }

  /**
   * The accessor of context for this {@linkcode Machine}.
   *
   * @see {@linkcode types.PrimitiveObject}
   * @see {@linkcode Tc}
   */
  get context() {
    const out = this.#elements.context;
    return out;
  }

  /**
   * The accessor of private context for this {@linkcode Machine}.
   *
   * @see {@linkcode Pc}
   */
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

  // #region Providers

  #getInitialKeys = () => {
    const entries = Object.entries(this.#flat);
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

  retrieveParentFromInitial = (target: string): NodeConfig => {
    const check1 = this.isInitial(target);
    const flat: any = this.#flat;
    if (check1) {
      const parent = target.substring(
        0,
        target.lastIndexOf(DEFAULT_DELIMITER),
      );
      const check2 = this.isInitial(parent);

      if (check2) return this.retrieveParentFromInitial.bind(this)(parent);
      return flat[parent];
    }
    return flat[target];
  };

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

  /**
   * Provides options for the machine.
   *
   * @param option a function that provides options for the machine.
   * Options can include actions, predicates, delays, promises, and child machines.
   * @returns a new instance of the machine with the provided options applied.
   */
  provideOptions = (
    option: Parameters<(typeof this)['addOptions']>[0],
  ) => {
    const out = this.renew;
    out.addOptions(option);

    return out;
  };
  // #endregion

  /**
   * Get all meaningful elements of the machine.
   *
   * @see {@linkcode Elements}
   *
   * @see type inferences :
   *
   * @see {@linkcode Config} , {@linkcode C} , {@linkcode GetEventsFromConfig} , {@linkcode E} , {@linkcode PromiseeMap} , {@linkcode GetPromiseeSrcFromConfig} , {@linkcode P} , {@linkcode Pc} , {@linkcode types.PrimitiveObject} , {@linkcode Tc} , {@linkcode SimpleMachineOptions2} , {@linkcode MachineOptions} , {@linkcode Mo}
   */
  get #elements(): Elements<C, E, P, Pc, Tc, Mo> {
    const config = structuredClone(this.#config);
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

  /**
   * Provides elements of the machine.
   * @param key the key of the element to provide.
   * @param value the value of the element to provide.
   * If not provided, the current elements will be returned.
   * @returns the elements of the machine with the provided key and value.
   *
   * @see {@linkcode Elements}
   *
   * @see type inferences :
   *
   *  {@linkcode Config} , {@linkcode C} , {@linkcode GetEventsFromConfig} , {@linkcode E} , {@linkcode PromiseeMap} , {@linkcode GetPromiseeSrcFromConfig} , {@linkcode P} , {@linkcode Pc} , {@linkcode types.PrimitiveObject} , {@linkcode Tc} , {@linkcode SimpleMachineOptions2} , {@linkcode MachineOptions} , {@linkcode Mo}
   */

  /**
   * Renews the machine with the provided key and value.
   * @param key the key of the element to provide.
   * @param value the value of the element to provide.
   * If not provided, the current elements will be returned.
   * @returns a new instance of this {@linkcode Machine} with the provided key and value.
   *
   * @see {@linkcode Elements}
   *
   * @see type inferences :
   *
   *  {@linkcode Config} , {@linkcode C} , {@linkcode GetEventsFromConfig} , {@linkcode E} , {@linkcode PromiseeMap} , {@linkcode GetPromiseeSrcFromConfig} , {@linkcode P} , {@linkcode Pc} , {@linkcode types} , {@linkcode Tc} , {@linkcode SimpleMachineOptions2} , {@linkcode MachineOptions} , {@linkcode Mo}
   */
  #renew = (): Machine<C, Pc, Tc, E, P, Mo> => {
    const {
      config,
      pContext,
      context,
      predicates,
      actions,
      delays,
      promises,
      machines,
      promisees,
      events,
    } = this.#elements;

    const out = new Machine<C, Pc, Tc, E, P, Mo>(config);

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

  /**
   * Returns a new instance from this {@linkcode Machine} with all its {@linkcode Elements}.
   */
  get renew() {
    const out = this.#renew();

    return out;
  }

  /**
   * @deprecated
   * @remarks used internally
   */
  _providePrivateContext = <T = any>(pContext: T) => {
    const { context, config, events, promisees } = this.#elements;

    const out = new Machine<C, T, Tc, E, P>(config);

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
   * @deprecated
   * @remarks used internally
   */
  _provideContext = <T extends types.PrimitiveObject>(context: T) => {
    const { pContext, config, events, promisees } = this.#elements;

    const out = new Machine<C, Pc, T, E, P>(config);

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
   * @deprecated
   * @remarks used internally
   */
  _provideEvents = <T extends EventsMap>(map: T) => {
    const { pContext, config, context, promisees } = this.#elements;

    const out = new Machine<C, Pc, Tc, T, P>(config);

    out.#pContext = pContext;
    out.#context = context;
    out.#eventsMap = map;
    out.#promiseesMap = promisees;

    return out;
  };

  /**
   * @deprecated
   * @remarks used internally
   */
  _providePromisees = <T extends PromiseeMap>(map: T) => {
    const { pContext, config, context, events } = this.#elements;

    const out = new Machine<C, Pc, Tc, E, T>(config);

    out.#pContext = pContext;
    out.#context = context;
    out.#eventsMap = events;
    out.#promiseesMap = map;

    return out;
  };

  /**
   * Converts a {@linkcode StateValue} to a {@linkcode NodeConfigWithInitials} with the {@linkcode NodeConfigWithInitials} postConfig of this {@linkcode Machine}.
   *
   * @param from the {@linkcode StateValue} to convert.
   * @returns the converted {@linkcode NodeConfigWithInitials}.
   *
   * @see {@linkcode valueToNode}
   */
  valueToConfig = (from: StateValue) => {
    return valueToNode(this.#config, from);
  };

  /**
   * The accessor of the initial node config of this {@linkcode Machine}.
   */
  get initialConfig() {
    return this.#initialConfig;
  }

  /**
   * The accessor of the initial {@linkcode StateValue} of this {@linkcode Machine}.
   *
   * @see {@linkcode nodeToValue}
   */
  get initialValue() {
    return nodeToValue(this.#initialConfig);
  }

  /**
   * Alias of {@linkcode valueToConfig} method.
   */
  toNode = this.valueToConfig;

  get options() {
    const predicates = this.#predicates;
    const actions = this.#actions;
    const delays = this.#delays;
    const promises = this.#promises;
    const machines = this.#machines;

    const out = castings.commons<Mo>({
      predicates,
      actions,
      delays,
      promises,
      machines,
    });

    return out;
  }

  // #region Options helper functions

  /**
   * Function helper to check if a value matches the provided values
   *
   * @see type inferences :
   *
   * {@linkcode GetEventsFromConfig} , {@linkcode E} , {@linkcode PromiseeMap} , {@linkcode GetPromiseeSrcFromConfig} , {@linkcode P} , {@linkcode Pc} , {@linkcode types.PrimitiveObject} , {@linkcode Tc}
   *
   * @see {@linkcode isValue}
   */
  get #isValue() {
    return isValue<E, P, Pc, Tc>;
  }

  /**
   * Function helper to check if a value is not one of the provided values.
   *
   * @see type inferences :
   *
   * {@linkcode GetEventsFromConfig} , {@linkcode E} , {@linkcode PromiseeMap} , {@linkcode GetPromiseeSrcFromConfig} , {@linkcode P} , {@linkcode Pc} , {@linkcode types.PrimitiveObject} , {@linkcode Tc}
   *
   * @see {@linkcode isNotValue}
   */
  get #isNotValue() {
    return isNotValue<E, P, Pc, Tc>;
  }

  /**
   * Function helper to check if a value is defined
   *
   * @see type inferences :
   *
   * {@linkcode GetEventsFromConfig} , {@linkcode E} , {@linkcode PromiseeMap} , {@linkcode GetPromiseeSrcFromConfig} , {@linkcode P} , {@linkcode Pc} , {@linkcode types.PrimitiveObject} , {@linkcode Tc}
   *
   * @see {@linkcode isDefinedS}
   */
  get #isDefined() {
    return isDefinedS<E, P, Pc, Tc>;
  }

  /**
   * Function helper to check if a value is undefined or null
   * @see type inferences :
   *
   * {@linkcode GetEventsFromConfig} , {@linkcode E} , {@linkcode PromiseeMap} , {@linkcode GetPromiseeSrcFromConfig} , {@linkcode P} , {@linkcode Pc} , {@linkcode types.PrimitiveObject} , {@linkcode Tc}
   *
   * @see {@linkcode isDefinedS}
   */
  get #isNotDefined() {
    return isNotDefinedS<E, P, Pc, Tc>;
  }

  /**
   * Function helper to create a child service for this {@linkcode Machine}.
   *
   * @see type inferences :
   *
   * {@linkcode GetEventsFromConfig} , {@linkcode E} , {@linkcode PromiseeMap} , {@linkcode GetPromiseeSrcFromConfig} , {@linkcode P} , {@linkcode Pc}
   *
   * @see {@linkcode createChildS}
   */
  #createChild: CreateChild_F<E, P, Pc> = (...args) => {
    return createChildS(...args);
  };
  // #endregion

  /**
   * Function helper to send an event to a child service.
   *
   * @param _ an optional parameter of type {@linkcode AnyMachine} [{@linkcode T}] to specify the machine context. Only used for type inference.
   *
   * @see type inferences :
   *
   * {@linkcode GetEventsFromConfig} , {@linkcode E} , {@linkcode PromiseeMap} , {@linkcode GetPromiseeSrcFromConfig} , {@linkcode P} , {@linkcode Pc} , {@linkcode types.PrimitiveObject} , {@linkcode Tc}
   *
   * @see {@linkcode reduceFnMap}
   */
  #sendTo: SendAction_F<E, P, Pc, Tc> = <T extends AnyMachine>(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _?: T,
  ) => {
    return fn => {
      const fn2 = reduceFnMap(this.eventsMap, this.promiseesMap, fn);
      return ({ context, pContext, ...rest }) => {
        const state = this.#cloneState({ context, pContext, ...rest });
        const { event, to } = fn2(state);

        const sentEvent = { to, event };

        return castings.commons.any({ context, pContext, sentEvent });
      };
    };
  };

  /**
   * Function helper to perform a void action.
   *
   * @param fn the action function to perform.
   *
   * @see type inferences :
   *
   * {@linkcode GetEventsFromConfig} , {@linkcode E} , {@linkcode PromiseeMap} , {@linkcode GetPromiseeSrcFromConfig} , {@linkcode P} , {@linkcode Pc} , {@linkcode types.PrimitiveObject} , {@linkcode Tc}
   *
   * @see {@linkcode VoidAction_F}
   */
  #voidAction: VoidAction_F<E, P, Pc, Tc> = fn => {
    return ({ context, pContext, ...rest }) => {
      if (fn) {
        const state = this.#cloneState({ context, pContext, ...rest });
        fn(state);
      }
      return castings.commons.any({ context, pContext });
    };
  };

  #timeAction = (name: string): TimeAction_F<E, P, Pc, Tc> => {
    return id =>
      ({ context, pContext }) => {
        return castings.commons.any({ context, pContext, [name]: id });
      };
  };

  #cloneState = (state: StateExtended<Pc, Tc, ToEvents<E, P>>) => {
    return structuredClone(state);
  };

  /**
   * Provides options for the machine.
   *
   * @param option a function that provides options for the machine.
   * Options can include actions, predicates, delays, promises, and child machines.
   */
  addOptions: AddOptions_F<E, P, Pc, Tc, Mo> = func => {
    const isValue = this.#isValue;
    const isNotValue = this.#isNotValue;
    const isDefined = this.#isDefined;
    const isNotDefined = this.#isNotDefined;
    const createChild = this.#createChild;
    const voidAction = this.#voidAction;
    const sendTo = this.#sendTo;

    const out = func({
      isValue,
      isNotValue,
      isDefined,
      isNotDefined,
      createChild,
      assign: (key, fn) => {
        const out = castings.commons.any(expandFnMap)(
          this.#eventsMap,
          this.#promiseesMap,
          castings.commons.any(key),
          fn,
        );

        return out;
      },
      voidAction,
      sendTo,
      debounce: (fn, { id, ms = 100 }) => {
        return ({ context, pContext, ...rest }) => {
          const state = this.#cloneState({ context, pContext, ...rest });
          const data = fn(state);

          const scheduled: ScheduledData<Pc, Tc> = { data, ms, id };

          return castings.commons.any({
            context,
            pContext,
            scheduled,
          });
        };
      },

      resend: resend => {
        return ({ context, pContext }) => {
          return castings.commons.any({
            context,
            pContext,
            resend,
          });
        };
      },

      forceSend: forceSend => {
        return ({ context, pContext }) => {
          return castings.commons.any({
            context,
            pContext,
            forceSend,
          });
        };
      },

      pauseActivity: this.#timeAction('pauseActivity'),
      resumeActivity: this.#timeAction('resumeActivity'),
      stopActivity: this.#timeAction('stopActivity'),
      pauseTimer: this.#timeAction('pauseTimer'),
      resumeTimer: this.#timeAction('resumeTimer'),
      stopTimer: this.#timeAction('stopTimer'),
    });

    this.#addActions(out?.actions);
    this.#addPredicates(out?.predicates);
    this.#addDelays(out?.delays);
    this.#addPromises(out?.promises);
    this.#addMachines(out?.machines);
  };
}

/**
 * Helper to retrieve entry or exit actions from a node.
 *
 * @see {@linkcode GetIO_F}
 * @see {@linkcode toArray.typed}
 * @see {@linkcode isAtomic}
 * @see {@linkcode isCompound}
 */
const getIO: GetIO_F = (key, node) => {
  if (!node) return [];
  const out = toArray.typed(node?.[key]);

  if (isAtomic(node)) return out;
  const states = node.states;

  if (isCompound(node)) {
    const initial = states[node.initial];

    out.push(...getIO(key, initial));
  }

  return out;
};

/**
 * Retrieves all entry actions from a node.
 */
export const getEntries = partialCall(getIO, 'entry');

/**
 * Retrieves all exit actions from a node.
 */
export const getExits = partialCall(getIO, 'exit');

export type { Machine };

export type CreateMachine_F = <
  const C2 extends
    NoExtraKeysConfigDef<ConfigDef> = NoExtraKeysConfigDef<ConfigDef>,
  const C extends Config & TransformConfigDef<C2> = Config &
    TransformConfigDef<C2>,
  Pc = any,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
  EventM extends GetEventsFromConfig<C> = GetEventsFromConfig<C>,
  P extends PromiseeMap = GetPromiseeSrcFromConfig<C>,
  Mo extends MachineOptions<C, EventM, P, Pc, Tc> = MachineOptions<
    C,
    EventM,
    P,
    Pc,
    Tc
  >,
>(
  config: NoExtraKeysConfig<C & { __tsSchema?: NoExtraKeysConfigDef<C2> }>,
  types: { pContext: Pc; context: Tc; eventsMap: EventM; promiseesMap: P },
) => Machine<C, Pc, Tc, EventM, P, Mo>;

/**
 * Creates a new instance of {@linkcode Machine} with the provided configuration and types.
 *
 * @param config The configuration for the machine.
 * @param types An object containing the types for the machine:
 * - `pContext`: The private context type.
 * - `context`: The context type.
 * - `eventsMap`: The events map type derived from the configuration.
 * - `promiseesMap`: The promisees map type derived from the configuration.
 *
 * @param initials The initials {@linkcode StateValue} for all compound node configs for the {@linkcode Machine}, derived from the configuration.
 * @returns A new instance of {@linkcode Machine} with the provided configuration and types.
 *
 * @see {@linkcode CreateMachine_F}
 */
export const createMachine: CreateMachine_F = (
  config,
  { eventsMap, pContext, context, promiseesMap },
) => {
  const out = new Machine(config as Config)
    ._provideEvents(eventsMap)
    ._providePrivateContext(pContext)
    ._provideContext(context)
    ._providePromisees(promiseesMap);

  return out as any;
};
