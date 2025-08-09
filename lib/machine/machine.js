import '../constants/errors.js';
import { DEFAULT_DELIMITER } from '../constants/strings.js';
import { decompose, recompose } from '@bemedev/decompose';
import 'fast-deep-equal';
import '../utils/environment.js';
import { merge } from '../utils/merge.js';
import { reduceFnMap } from '../utils/reduceFnMap.js';
import { resolve } from '../utils/resolve.js';
import '../utils/typings.js';
import { isDefinedS, isNotDefinedS } from '../guards/functions/helpers/isDefined.js';
import { isValue, isNotValue } from '../guards/functions/helpers/value.js';
import { partialCall, toArray } from '@bemedev/basifun';
import '@bemedev/boolean-recursive';
import { isCompound } from '../states/functions/checks/isCompound.js';
import { isAtomic } from '../states/functions/checks/isAtomic.js';
import { flatMap } from '../states/functions/flatMap.js';
import { initialConfig } from '../states/functions/initialConfig.js';
import { typings, castings } from '@bemedev/types';
import { nodeToValue } from '../states/functions/nodeToValue.js';
import { recomposeConfig } from '../states/functions/recompose.js';
import '@bemedev/basifun/objects/identify';
import { valueToNode } from '../states/functions/valueToNode.js';
import cloneDeep from 'clone-deep';
import { createChildS } from './functions/create.js';
import { expandFnMap } from './functions/expandFnMap.js';
import './functions/subcriber/contexts.js';

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
class Machine {
    /**
     * The configuration of the machine for this {@linkcode Machine}.
     *
     * @see {@linkcode Config}
     * @see {@linkcode C}
     */
    #config;
    /**
     * The flat map of the configuration for this {@linkcode Machine}.
     *
     * @see {@linkcode FlatMapN}
     * @see {@linkcode Config}
     * @see {@linkcode C}
     */
    #flat;
    #decomposed;
    /**
     * The map of events for this {@linkcode Machine}.
     *
     * @see {@linkcode EventsMap}
     * @see {@linkcode E}
     */
    #eventsMap;
    /**
     * The map of promisees for this {@linkcode Machine}.
     *
     * @see {@linkcode PromiseeMap}
     * @see {@linkcode P}
     */
    #promiseesMap;
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
        return typings.commons();
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
        return typings.commons();
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
        return typings.commons();
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
        return typings.commons();
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
        return typings.commons();
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
        return typings.commons();
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
        return typings.commons();
    }
    #typingsByKey = (key) => {
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
        return typings.commons();
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
        return typings.commons();
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
        return typings.commons();
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
        return typings.commons();
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
        return typings.commons();
    }
    // #endregion
    // #region private
    #actions;
    #predicates;
    #delays;
    #promises;
    #machines;
    /**
     * Initials {@linkcode StateValue}s for all compound {@linkcode NodeConfigWithInitials}.
     */
    #initials;
    #targets;
    /**
     * Context for this {@linkcode Machine}.
     *
     * @see {@linkcode types.PrimitiveObject}
     * @see {@linkcode Tc}
     */
    #context;
    /**
     * Private context for this {@linkcode Machine}.
     *
     * @see {@linkcode Pc}
     */
    #pContext;
    /**
     * Config of this {@linkcode Machine} after setting all initials {@linkcode StateValue}s.
     *
     * @see {@linkcode NodeConfigWithInitials}
     */
    #postConfig;
    /**
     * Flat representation of the {@linkcode NodeConfigWithInitials} of this {@linkcode Machine} after setting all initials {@linkcode StateValue}s.
     *
     * @see {@linkcode RecordS}
     */
    #postflat;
    #initialKeys = [];
    /**
     * The initial node config of this {@linkcode Machine}.
     */
    #initialConfig;
    // #endregion
    /**
     * Creates an instance of Machine.
     *
     * @param config : of type {@linkcode Config} [C] - The configuration for the machine.
     *
     * @remarks
     * This constructor initializes the machine with the provided configuration.
     * It flattens the configuration and prepares it for further operations ({@linkcode preflat}).
     */
    constructor(config) {
        this.#config = config;
        this.#decomposed = decompose(config, {
            start: false,
            object: 'both',
        });
        this.#flat = flatMap(config);
    }
    /**
     * The accessor configuration of the machine for this {@linkcode Machine}.
     *
     * @see {@linkcode Config}
     * @see {@linkcode C}
     */
    get preConfig() {
        return this.#config;
    }
    /**
     * The public accessor of the flat map of the configuration for this {@linkcode Machine}.
     *
     * @see {@linkcode FlatMapN}
     * @see {@linkcode Config}
     * @see {@linkcode C}
     */
    get preflat() {
        return this.#flat;
    }
    /**
     * The public accessor of Config of this {@linkcode Machine} after setting all initials {@linkcode StateValue}s.
     *
     * @see {@linkcode NodeConfigWithInitials}
     */
    get postConfig() {
        return this.#postConfig;
    }
    /**
     * Public accessor of initial {@linkcode StateValue}s for all compound {@linkcode NodeConfigWithInitials}.
     */
    get initials() {
        return this.#initials;
    }
    get targets() {
        return this.#targets;
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
    get postflat() {
        return this.#postflat;
    }
    // #region Providers
    #addValues = (values) => {
        this.#initials = values.initials;
        this.#targets = values.targets;
        if (this.#targets) {
            const entriesT = Object.entries(this.#targets).map(([key, target]) => {
                const key1 = key
                    .slice(1)
                    .replace(new RegExp(DEFAULT_DELIMITER, 'g'), '.states.');
                const _key = `states.${key1}.target`;
                return [_key, target];
            });
            const decomposed = structuredClone(this.#decomposed);
            entriesT.forEach(([key, _target]) => {
                const from = key
                    .split(DEFAULT_DELIMITER)
                    .slice(0, -1)
                    .join(DEFAULT_DELIMITER);
                const target = resolve(from, _target);
                decomposed[key] = target;
            });
            const recomposed = recompose(decomposed);
            this.#flat = flatMap(recomposed, true);
        }
        const entries = Object.entries(this.#initials);
        const flat = structuredClone(this.#flat);
        entries.forEach(([key, initial]) => {
            flat[key] = { ...flat[key], initial };
        });
        this.#postConfig = recomposeConfig(flat);
        this.#initialConfig = initialConfig(this.#postConfig);
        this.#getInitialKeys();
        return this.#postConfig;
    };
    #getInitialKeys = () => {
        const postConfig = this.#postConfig;
        this.#postflat = flatMap(postConfig, true);
        const entries = Object.entries(this.#postflat);
        entries.forEach(([key, { initial }]) => {
            const check1 = initial !== undefined;
            if (check1) {
                const toPush = `${key}${DEFAULT_DELIMITER}${initial}`;
                this.#initialKeys.push(toPush);
            }
        });
    };
    isInitial = (target) => {
        return this.#initialKeys.includes(target);
    };
    retrieveParentFromInitial = (target) => {
        const check1 = this.isInitial(target);
        if (check1) {
            const parent = target.substring(0, target.lastIndexOf(DEFAULT_DELIMITER));
            const check2 = this.isInitial(parent);
            if (check2)
                return this.retrieveParentFromInitial.bind(this)(parent);
            return this.#postflat[parent];
        }
        return this.#postflat[target];
    };
    /**
     * @deprecated
     * @remarks used internally
     */
    _provideValues = (values) => {
        const out = this.#renew();
        out.#addValues(values);
        return out;
    };
    #addActions = (actions) => (this.#actions = merge(this.#actions, actions));
    #addPredicates = (predicates) => (this.#predicates = merge(this.#predicates, predicates));
    #addDelays = (delays) => (this.#delays = merge(this.#delays, delays));
    #addPromises = (promises) => (this.#promises = merge(this.#promises, promises));
    #addMachines = (machines) => (this.#machines = merge(this.#machines, machines));
    /**
     * Provides options for the machine.
     *
     * @param option a function that provides options for the machine.
     * Options can include actions, predicates, delays, promises, and child machines.
     * @returns a new instance of the machine with the provided options applied.
     */
    provideOptions = (option) => {
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
    get #elements() {
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
    #renew = () => {
        const { config, pContext, context, predicates, actions, delays, promises, machines, promisees, events, } = this.#elements;
        const out = new Machine(config);
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
        out.#addValues({
            initials: this.#initials,
            targets: this.#targets,
        });
        return out;
    }
    /**
     * @deprecated
     * @remarks used internally
     */
    _providePrivateContext = (pContext) => {
        const { context, config, events, promisees } = this.#elements;
        const out = new Machine(config);
        out.#addValues({ initials: this.#initials, targets: this.#targets });
        out.#context = context;
        out.#pContext = pContext;
        out.#eventsMap = events;
        out.#promiseesMap = promisees;
        return out;
    };
    addPrivateContext = (pContext) => {
        this.#pContext = pContext;
    };
    /**
     * @deprecated
     * @remarks used internally
     */
    _provideContext = (context) => {
        const { pContext, config, events, promisees } = this.#elements;
        const out = new Machine(config);
        out.#addValues({ initials: this.#initials, targets: this.#targets });
        out.#pContext = pContext;
        out.#context = context;
        out.#eventsMap = events;
        out.#promiseesMap = promisees;
        return out;
    };
    addContext = (context) => {
        this.#context = context;
    };
    /**
     * @deprecated
     * @remarks used internally
     */
    _provideEvents = (map) => {
        const { pContext, config, context, promisees } = this.#elements;
        const out = new Machine(config);
        out.#addValues({ initials: this.#initials, targets: this.#targets });
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
    _providePromisees = (map) => {
        const { pContext, config, context, events } = this.#elements;
        const out = new Machine(config);
        out.#addValues({ initials: this.#initials, targets: this.#targets });
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
    valueToConfig = (from) => {
        return valueToNode(this.#postConfig, from);
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
        const initials = this.#initials;
        const out = castings.commons({
            predicates,
            actions,
            delays,
            promises,
            machines,
            initials,
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
        return isValue;
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
        return isNotValue;
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
        return isDefinedS;
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
        return isNotDefinedS;
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
    #createChild = (...args) => {
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
    #sendTo = (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _) => {
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
    #voidAction = fn => {
        return ({ context, pContext, ...rest }) => {
            if (fn) {
                const state = this.#cloneState({ context, pContext, ...rest });
                fn(state);
            }
            return castings.commons.any({ context, pContext });
        };
    };
    #timeAction = (name) => {
        return id => ({ context, pContext }) => {
            return castings.commons.any({ context, pContext, [name]: id });
        };
    };
    #cloneState = (state) => {
        return structuredClone(state);
    };
    /**
     * Provides options for the machine.
     *
     * @param option a function that provides options for the machine.
     * Options can include actions, predicates, delays, promises, and child machines.
     */
    addOptions = func => {
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
                const out = castings.commons.any(expandFnMap)(this.#eventsMap, this.#promiseesMap, castings.commons.any(key), fn);
                return out;
            },
            voidAction,
            sendTo,
            debounce: (fn, { id, ms = 100 }) => {
                return ({ context, pContext, ...rest }) => {
                    const state = this.#cloneState({ context, pContext, ...rest });
                    const data = fn(state);
                    const scheduled = { data, ms, id };
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
const getIO = (key, node) => {
    if (!node)
        return [];
    const out = toArray.typed(node?.[key]);
    if (isAtomic(node))
        return out;
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
const getEntries = partialCall(getIO, 'entry');
/**
 * Retrieves all exit actions from a node.
 */
const getExits = partialCall(getIO, 'exit');
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
const createMachine = (config, { eventsMap, pContext, context, promiseesMap }, values) => {
    const out = new Machine(config)
        ._provideValues(values)
        ._provideEvents(eventsMap)
        ._providePrivateContext(pContext)
        ._provideContext(context)
        ._providePromisees(promiseesMap);
    return out;
};

export { createMachine, getEntries, getExits };
//# sourceMappingURL=machine.js.map
