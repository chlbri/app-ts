import _any from '#bemedev/features/common/castings/any';
import commonT from '#bemedev/features/common/typings';
import extract from '#bemedev/features/common/typings/extract';
import byKey from '#bemedev/features/objects/typings/byKey';
import keysOf from '#bemedev/features/objects/typings/keysOf';
import type {
  AllowedNames,
  NotUndefined,
  PrimitiveObject,
} from '#bemedev/globals/types';
import { DEFAULT_DELIMITER } from '#constants';
import {
  type ActorsConfigMap,
  type EventsMap,
  type PromiseeMap,
  type ToEvents,
  type ToEvents2,
  type ToEventsR2,
} from '#events';
import {
  isDefinedS,
  isNotDefinedS,
  isNotValue,
  isValue,
  type DefinedValue,
} from '#guards';
import type {
  State,
  StateExtended,
  StateP,
  StatePextended,
} from '#interpreters';
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
import type { Action } from 'src/actions/types2';
import type { Delay } from 'src/delays/types2';
import { type PromiseFunction } from 'src/promises/types2';

import { _unknown } from '#bemedev/globals/utils/_unknown';
import cloneDeep from 'clone-deep';
import type { PredicateS } from 'src/guards/types2';
import type { NoExtraKeysStrict } from '~types';
import {
  assignByKey,
  createChildS,
  expandFnMap,
  getByKey,
  type CreateChild_F,
} from './functions';
import type {
  AddOption,
  AddOptions_F,
  AddOptionsParam_F,
  AnyMachine,
  Elements,
  GetIO_F,
  LegacyOptions,
  ScheduledData,
  SendAction_F,
  TimeAction_F,
  VoidAction_F,
} from './machine.types2';
import type {
  Config,
  ConfigDef,
  GetActorsSrcKeyFromConfig,
  GetEventsFromConfig,
  GetMachineKeysFromFlat,
  GetPromiseesSrcFromConfig,
  MachineOptions,
  NoExtraKeysConfig,
  NoExtraKeysConfigDef,
  SimpleMachineOptions2,
  TransformConfigDef,
} from './types2';

/**
 * A class representing a state machine.
 * It provides methods to manage states, actions, predicates, delays, promises, and machines.
 *
 * @template : {@linkcode Config} [C] - The configuration type of the machine.
 * @template Pc : The private context type of the machine.
 * @template : {@linkcode PrimitiveObject} [Pc] - The context type of the machine.
 * @template : {@linkcode GetEventsFromConfig}<{@linkcode C}> [E] - The events map type derived from the configuration.
 * @template : {@linkcode PromiseeMap} [P] - The promisees map type derived from the configuration. Defaults to {@linkcode GetPromiseesSrcFromConfig}<{@linkcode C}>.
 * @template : {@linkcode SimpleMachineOptions2} [Mo] - The options type for the machine, which includes actions, predicates, delays, promises, and machines. Defaults to {@linkcode MachineOptions}<[{@linkcode C} , {@linkcode E} , {@linkcode A} , {@linkcode Pc} , {@linkcode Tc} ]>.
 *
 * @implements {@linkcode AnyMachine}<{@linkcode E} , {@linkcode A} , {@linkcode Pc} , {@linkcode Tc} >
 */

class Machine<
  const C extends Config = Config,
  const Pc = any,
  const Tc extends PrimitiveObject = PrimitiveObject,
  E extends GetEventsFromConfig<C> = GetEventsFromConfig<C>,
  A extends ActorsConfigMap = GetActorsSrcKeyFromConfig<C>,
  Mo extends SimpleMachineOptions2 = MachineOptions<C, E, A, Pc, Tc>,
> implements AnyMachine<E, A, Pc, Tc> {
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

  #decomposed: any;

  get decomposed() {
    return this.#decomposed as Decompose<
      C,
      { sep: '.'; start: false; object: 'both' }
    >;
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
   * @see {@linkcode A}
   */
  #actorsMap!: A;

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
   * @see {@linkcode A}
   */
  get actorsMap() {
    return this.#actorsMap;
  }

  /**
   * @deprecated
   *
   * This property provides the events map for this {@linkcode Machine} as a type.
   *
   * @see {@linkcode ToEvents2}
   * @see {@linkcode E}
   * @see {@linkcode A}
   *
   * @remarks Used for typing purposes only.
   */
  get __events() {
    return _unknown<ToEvents2<E, A>>();
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
   * @see {@linkcode A}
   * @see {@linkcode Pc}
   * @see {@linkcode PrimitiveObject}
   * @see {@linkcode Tc}
   */
  get __actionFn() {
    return _unknown<Action<E, A, Pc, Tc>>();
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
   * @see {@linkcode PrimitiveObject}
   * @see {@linkcode Tc}
   */
  get __actionParams() {
    return _unknown<{ pContext: Pc; context: Tc; map: E }>();
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
   * @see {@linkcode PrimitiveObject}
   * @see {@linkcode Pc}
   * @see {@linkcode Tc}
   */
  get __stateExtended() {
    return _unknown<StateExtended<Pc, Tc, ToEvents2<E, A>>>();
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
   * @see {@linkcode PrimitiveObject}
   * @see {@linkcode Pc}
   * @see {@linkcode Tc}
   */
  get __state() {
    return _unknown<State<Tc, ToEventsR2<E, A>>>();
  }

  /**
   * @deprecated
   *
   * This property provides the state payload for this {@linkcode Machine} as a type.
   *
   * @remarks Used for typing purposes only.
   *
   * @see {@linkcode StateP}
   * @see {@linkcode ToEventsR2}
   * @see {@linkcode E}
   * @see {@linkcode PrimitiveObject}
   * @see {@linkcode Pc}
   * @see {@linkcode Tc}
   */
  get __stateP() {
    return _unknown<StateP<Tc, ToEventsR2<E, A>['payload']>>();
  }

  /**
   * @deprecated
   *
   * This property provides the extended state payload for this {@linkcode Machine} as a type.
   *
   * @remarks Used for typing purposes only.
   *
   * @see {@linkcode StatePextended}
   * @see {@linkcode ToEventsR2}
   * @see {@linkcode E}
   * @see {@linkcode PrimitiveObject}
   * @see {@linkcode Pc}
   * @see {@linkcode Tc}
   */
  get __statePextended() {
    return _unknown<StatePextended<Pc, Tc, ToEventsR2<E, A>['payload']>>();
  }

  #typingsByKey = <
    K extends AllowedNames<AnyMachine<E, A, Pc, Tc>, object | undefined>,
  >(
    key: K,
  ) => {
    const _this = commonT.dynamic(this);
    const out1 = byKey(_this, key);
    const out2 = extract(out1, {} as object);
    const out3 = keysOf.union(out2);

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
   * @see {@linkcode A}
   * @see {@linkcode Pc}
   * @see {@linkcode PrimitiveObject}
   * @see {@linkcode Tc}
   */
  get __predictate() {
    return _unknown<PredicateS<E, A, Pc, Tc>>();
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
   * @see {@linkcode A}
   * @see {@linkcode Pc}
   * @see {@linkcode PrimitiveObject}
   * @see {@linkcode Tc}
   */
  get __delay() {
    return _unknown<Delay<E, A, Pc, Tc>>();
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
   * @see {@linkcode PrimitiveObject}
   * @see {@linkcode Tc}
   */
  get __definedValue() {
    return _unknown<DefinedValue<Pc, Tc>>();
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
   * @see {@linkcode A}
   * @see {@linkcode Pc}
   * @see {@linkcode PrimitiveObject}
   * @see {@linkcode Tc}
   */
  get __promise() {
    return _unknown<PromiseFunction<E, A, Pc, Tc>>();
  }

  /**
   * @deprecated
   *
   * This property provides any machine key for this {@linkcode Machine} as a type.
   *
   * @remarks Used for typing purposes only.
   */
  get __childKey() {
    return undefined as unknown as GetMachineKeysFromFlat<
      typeof this.flat
    >;
  }

  /**
   * @deprecated
   *
   * Return this {@linkcode Machine} as a type.
   *
   * @remarks Used for typing purposes only.
   */
  get __machine() {
    return _unknown<this>();
  }
  // #endregion

  // #region private
  #actions?: Mo['actions'];

  #predicates?: Mo['predicates'];

  #delays?: Mo['delays'];

  #actors?: Mo['actors'];

  /**
   * Initials {@linkcode StateValue}s for all compound {@linkcode NodeConfigWithInitials}.
   */

  /**
   * Context for this {@linkcode Machine}.
   *
   * @see {@linkcode PrimitiveObject}
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
    this.#flat = flatMap(this.#config, true);
    this.#initialConfig = initialConfig(this.#config);
    this.#getInitialKeys();
    this.longRuns = this.#config.__longRuns === true;
  }

  readonly longRuns: boolean;

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
   * @see {@linkcode PrimitiveObject}
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
    return this.#actors?.promises;
  }

  get children() {
    return this.#actors?.children;
  }

  get emitters() {
    return this.#actors?.emitters;
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

  #addPromises = (promises?: NotUndefined<Mo['actors']>['promises']) =>
    (this.#actors = merge(this.#actors, { promises }));

  #addMachines = (machines?: NotUndefined<Mo['actors']>['children']) =>
    (this.#actors = merge(this.#actors, { children: machines }));

  #addEmitters = (emitters?: NotUndefined<Mo['actors']>['emitters']) =>
    (this.#actors = merge(this.#actors, { emitters }));

  /**
   * Create options for the machine.
   *
   * @param option a function that provides options for the machine.
   * Options can include actions, predicates, delays, promises, and child machines.
   *
   * Remark: Used for typings, when you're outside the Machine class.
   */
  createOptions = <T extends Mo>(
    helper: (
      functions: AddOption<E, A, Pc, Tc>,
      options: {
        _legacy: LegacyOptions<E, A, Pc, Tc, Mo>;
      },
    ) => NoExtraKeysStrict<T, Mo>,
  ) => {
    const isValue = this.#isValue;
    const isNotValue = this.#isNotValue;
    const isDefined = this.#isDefined;
    const isNotDefined = this.#isNotDefined;
    const createChild = this.#createChild;
    const voidAction = this.#voidAction;
    const sendTo = this.#sendTo;

    const _legacy = Object.freeze({
      actions: cloneDeep(this.#actions),
      predicates: cloneDeep(this.#predicates),
      delays: cloneDeep(this.#delays),
      promises: cloneDeep(this.#actors?.promises),
      machines: cloneDeep(this.#actors?.children),
      emitters: cloneDeep(this.#actors?.emitters),
    });

    const out = helper(
      {
        isValue,
        isNotValue,
        isDefined,
        isNotDefined,
        createChild,

        assign: (key, fn) => {
          const out = _any(expandFnMap)(
            this.#eventsMap,
            this.#actorsMap,
            _any(key),
            fn,
          );

          return out;
        },

        batch: (...fns) => {
          return ({ context, pContext, ...rest }) => {
            const state = this.#cloneStateExtended({
              context,
              pContext,
              ...rest,
            });

            let out: any;
            fns
              .filter(f => !!f)
              .forEach(fn => {
                if (!out) out = fn(state);
                else out = fn({ ...out, ...rest });
              });

            return out;
          };
        },

        filter: (key, fn) => {
          return ({ context, pContext }) => {
            const currentValue = getByKey.low({ context, pContext }, key);

            const predicate = fn as any;

            let filteredValue: any;

            if (Array.isArray(currentValue)) {
              // Filter array elements
              filteredValue = currentValue.filter(predicate);
            } else if (
              currentValue !== null &&
              typeof currentValue === 'object'
            ) {
              // Filter object properties
              filteredValue = Object.entries(currentValue).reduce(
                (acc, [objKey, value]) => {
                  const check = predicate(value, currentValue);
                  if (check) acc[objKey] = value;
                  return acc;
                },
                {} as any,
              );
            }

            return assignByKey({ context, pContext }, key, filteredValue);
          };
        },

        erase: key => {
          return ({ context, pContext }) => {
            const state = cloneDeep({
              context,
              pContext,
            });
            return assignByKey(state, key, undefined);
          };
        },

        voidAction,
        sendTo,

        debounce: (fn, { id, ms = 100 }) => {
          return ({ context, pContext, ...rest }) => {
            const state = this.#cloneStateExtended({
              context,
              pContext,
              ...rest,
            });
            const data = fn(state);

            const scheduled: ScheduledData<Pc, Tc> = { data, ms, id };

            return _any({
              context,
              pContext,
              scheduled,
            });
          };
        },

        resend: resend => {
          return ({ context, pContext }) => {
            return _any({
              context,
              pContext,
              resend,
            });
          };
        },

        forceSend: forceSend => {
          return ({ context, pContext }) => {
            return _any({
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
      },
      { _legacy },
    );

    return out;
  };

  /**
   * Provides options for the machine.
   *
   * @param option a function that provides options for the machine.
   * Options can include actions, predicates, delays, promises, and child machines.
   */
  addOptions: AddOptions_F<E, A, Pc, Tc, Mo> = helper => {
    const out = this.createOptions(helper);

    this.#addActions(out?.actions);
    this.#addPredicates(out?.predicates);
    this.#addDelays(out?.delays);
    this.#addPromises(out?.actors?.promises);
    this.#addMachines(out?.actors?.children);
    this.#addEmitters(out?.actors?.emitters);

    return out;
  };

  /**
   * Provides options for the machine.
   *
   * @param option a function that provides options for the machine.
   * Options can include actions, predicates, delays, promises, and child machines.
   * @returns a new instance of the machine with the provided options applied.
   */
  provideOptions = <T extends Mo>(
    option: AddOptionsParam_F<E, A, Pc, Tc, NoExtraKeysStrict<T, Mo>>,
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
   * @see {@linkcode Config} , {@linkcode C} , {@linkcode GetEventsFromConfig} , {@linkcode E} , {@linkcode PromiseeMap} , {@linkcode GetPromiseesSrcFromConfig} , {@linkcode A} , {@linkcode Pc} , {@linkcode PrimitiveObject} , {@linkcode Tc} , {@linkcode SimpleMachineOptions2} , {@linkcode MachineOptions} , {@linkcode Mo}
   */
  get #elements(): Elements<C, E, A, Pc, Tc, Mo> {
    const config = structuredClone(this.#config);
    const pContext = cloneDeep(this.#pContext);
    const context = structuredClone(this.#context);
    const actions = cloneDeep(this.#actions);
    const predicates = cloneDeep(this.#predicates);
    const delays = cloneDeep(this.#delays);
    const promises = cloneDeep(this.#promises);
    const machines = cloneDeep(this.#machines);
    const events = cloneDeep(this.#eventsMap);
    const promisees = cloneDeep(this.#actorsMap);
    const emitters = cloneDeep(this.#emitters);

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
      emitters,
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
   *  {@linkcode Config} , {@linkcode C} , {@linkcode GetEventsFromConfig} , {@linkcode E} , {@linkcode PromiseeMap} , {@linkcode GetPromiseesSrcFromConfig} , {@linkcode A} , {@linkcode Pc} , {@linkcode PrimitiveObject} , {@linkcode Tc} , {@linkcode SimpleMachineOptions2} , {@linkcode MachineOptions} , {@linkcode Mo}
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
   *  {@linkcode Config} , {@linkcode C} , {@linkcode GetEventsFromConfig} , {@linkcode E} , {@linkcode PromiseeMap} , {@linkcode GetPromiseesSrcFromConfig} , {@linkcode A} , {@linkcode Pc} , {@linkcode types} , {@linkcode Tc} , {@linkcode SimpleMachineOptions2} , {@linkcode MachineOptions} , {@linkcode Mo}
   */
  #renew = (): Machine<C, Pc, Tc, E, A, Mo> => {
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
      emitters,
    } = this.#elements;

    const out = new Machine<C, Pc, Tc, E, A, Mo>(config);

    out.#pContext = pContext;
    out.#context = context;
    out.#eventsMap = events;
    out.#actorsMap = promisees;

    out.#addPredicates(predicates);
    out.#addActions(actions);
    out.#addDelays(delays);
    out.#addPromises(promises);
    out.#addMachines(machines);
    out.#addEmitters(emitters);

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

    const out = new Machine<C, T, Tc, E, A>(config);

    out.#context = context;
    out.#pContext = pContext;
    out.#eventsMap = events;
    out.#actorsMap = promisees;

    return out;
  };

  addPrivateContext = (pContext: Pc) => {
    this.#pContext = pContext;
  };

  /**
   * @deprecated
   * @remarks used internally
   */
  _provideContext = <T extends PrimitiveObject>(context: T) => {
    const { pContext, config, events, promisees } = this.#elements;

    const out = new Machine<C, Pc, T, E, A>(config);

    out.#pContext = pContext;
    out.#context = context;
    out.#eventsMap = events;
    out.#actorsMap = promisees;

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

    const out = new Machine<C, Pc, Tc, T, A>(config);

    out.#pContext = pContext;
    out.#context = context;
    out.#eventsMap = map;
    out.#actorsMap = promisees;

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
    out.#actorsMap = map;

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
    return nodeToValue(this.#initialConfig as any);
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

    const out = _unknown<Mo>({
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
   * {@linkcode GetEventsFromConfig} , {@linkcode E} , {@linkcode PromiseeMap} , {@linkcode GetPromiseesSrcFromConfig} , {@linkcode A} , {@linkcode Pc} , {@linkcode PrimitiveObject} , {@linkcode Tc}
   *
   * @see {@linkcode isValue}
   */
  get #isValue() {
    return isValue<E, A, Pc, Tc>;
  }

  /**
   * Function helper to check if a value is not one of the provided values.
   *
   * @see type inferences :
   *
   * {@linkcode GetEventsFromConfig} , {@linkcode E} , {@linkcode PromiseeMap} , {@linkcode GetPromiseesSrcFromConfig} , {@linkcode A} , {@linkcode Pc} , {@linkcode PrimitiveObject} , {@linkcode Tc}
   *
   * @see {@linkcode isNotValue}
   */
  get #isNotValue() {
    return isNotValue<E, A, Pc, Tc>;
  }

  /**
   * Function helper to check if a value is defined
   *
   * @see type inferences :
   *
   * {@linkcode GetEventsFromConfig} , {@linkcode E} , {@linkcode PromiseeMap} , {@linkcode GetPromiseesSrcFromConfig} , {@linkcode A} , {@linkcode Pc} , {@linkcode PrimitiveObject} , {@linkcode Tc}
   *
   * @see {@linkcode isDefinedS}
   */
  get #isDefined() {
    return isDefinedS<E, A, Pc, Tc>;
  }

  /**
   * Function helper to check if a value is undefined or null
   * @see type inferences :
   *
   * {@linkcode GetEventsFromConfig} , {@linkcode E} , {@linkcode PromiseeMap} , {@linkcode GetPromiseesSrcFromConfig} , {@linkcode A} , {@linkcode Pc} , {@linkcode PrimitiveObject} , {@linkcode Tc}
   *
   * @see {@linkcode isDefinedS}
   */
  get #isNotDefined() {
    return isNotDefinedS<E, A, Pc, Tc>;
  }

  // #merge = (state: StateExtended<Pc, Tc, ToEvents<E, P>>) => {};

  /**
   * Function helper to create a child service for this {@linkcode Machine}.
   *
   * @see type inferences :
   *
   * {@linkcode GetEventsFromConfig} , {@linkcode E} , {@linkcode PromiseeMap} , {@linkcode GetPromiseesSrcFromConfig} , {@linkcode A} , {@linkcode Pc}
   *
   * @see {@linkcode createChildS}
   */
  #createChild: CreateChild_F<E, A, Pc> = (...args) => {
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
   * {@linkcode GetEventsFromConfig} , {@linkcode E} , {@linkcode PromiseeMap} , {@linkcode GetPromiseesSrcFromConfig} , {@linkcode A} , {@linkcode Pc} , {@linkcode PrimitiveObject} , {@linkcode Tc}
   *
   * @see {@linkcode reduceFnMap}
   */
  #sendTo: SendAction_F<E, A, Pc, Tc> = <T extends AnyMachine>(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _?: T,
  ) => {
    return fn => {
      const fn2 = reduceFnMap(this.eventsMap, this.promiseesMap, fn);
      return ({ context, pContext, ...rest }) => {
        const state = this.#cloneStateExtended({
          context,
          pContext,
          ...rest,
        });
        const { event, to } = fn2(state);

        const sentEvent = { to, event };

        return _any({ context, pContext, sentEvent });
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
   * {@linkcode GetEventsFromConfig} , {@linkcode E} , {@linkcode PromiseeMap} , {@linkcode GetPromiseesSrcFromConfig} , {@linkcode A} , {@linkcode Pc} , {@linkcode PrimitiveObject} , {@linkcode Tc}
   *
   * @see {@linkcode VoidAction_F}
   */
  #voidAction: VoidAction_F<E, A, Pc, Tc> = fn => {
    return ({ context, pContext, ...rest }) => {
      if (fn) {
        const _fn = reduceFnMap(this.#eventsMap, this.#actorsMap, fn);
        const state = this.#cloneStateExtended({
          context,
          pContext,
          ...rest,
        });
        _fn(state);
      }
      return _any({ context, pContext });
    };
  };

  #timeAction = (name: string): TimeAction_F<E, A, Pc, Tc> => {
    return id =>
      ({ context, pContext }) => {
        return _any({ context, pContext, [name]: id });
      };
  };

  #cloneStateExtended = (state: StateExtended<Pc, Tc, ToEvents<E, A>>) => {
    return structuredClone(state);
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
  const C2 extends NoExtraKeysConfigDef<ConfigDef> =
    NoExtraKeysConfigDef<ConfigDef>,
  const C extends Config & TransformConfigDef<C2> = Config &
    TransformConfigDef<C2>,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  EventM extends GetEventsFromConfig<C> = GetEventsFromConfig<C>,
  P extends PromiseeMap = GetPromiseesSrcFromConfig<C>,
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
 * Creates a new instance of {@linkcode Machine} with the provided configuration and
 *
 * @param config The configuration for the machine.
 * @param types An object containing the types for the machine:
 * - `pContext`: The private context type.
 * - `context`: The context type.
 * - `eventsMap`: The events map type derived from the configuration.
 * - `promiseesMap`: The promisees map type derived from the configuration.
 *
 * @param initials The initials {@linkcode StateValue} for all compound node configs for the {@linkcode Machine}, derived from the configuration.
 * @returns A new instance of {@linkcode Machine} with the provided configuration and
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
