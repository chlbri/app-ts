import type { Action } from '../actions/index.js';
import type { Delay } from '../delays/index.js';
import { type EventsMap, type PromiseeMap, type ToEvents, type ToEventsR } from '../events/index.js';
import { type DefinedValue, type PredicateS } from '../guards/index.js';
import type { State, StateExtended, StateP, StatePextended } from '../interpreters/index.js';
import { type PromiseFunction } from '../promises/index.js';
import { type FlatMapN, type NodeConfigWithInitials, type StateValue } from '../states/index.js';
import { type RecordS } from '../types/index.js';
import { type types } from '@bemedev/types';
import type { AddOptions_F, AnyMachine } from './machine.types';
import type { Config, GetEventsFromConfig, GetPromiseeSrcFromConfig, MachineOptions, SimpleMachineOptions2 } from './types';
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
declare class Machine<const C extends Config = Config, const Pc extends types.PrimitiveObject = types.PrimitiveObject, const Tc extends types.PrimitiveObject = types.PrimitiveObject, E extends GetEventsFromConfig<C> = GetEventsFromConfig<C>, P extends PromiseeMap = GetPromiseeSrcFromConfig<C>, Mo extends SimpleMachineOptions2 = MachineOptions<C, E, P, Pc, Tc>> implements AnyMachine<E, P, Pc, Tc> {
    #private;
    /**
     * Public accessor for the events map for this {@linkcode Machine}.
     *
     * @see {@linkcode EventsMap}
     * @see {@linkcode E}   */
    get eventsMap(): E;
    /**
     * Public accessor for the promisees map for this {@linkcode Machine}.
     *
     * @see {@linkcode PromiseeMap}
     * @see {@linkcode P}
     */
    get promiseesMap(): P;
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
    get __events(): ToEvents<E, P>;
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
    get __actionFn(): Action<E, P, Pc, Tc>;
    /**
     * @deprecated
     *
     * This property provides any action key for this {@linkcode Machine} as a type.
     *
     * @remarks Used for typing purposes only.
     */
    get __actionKey(): keyof Extract<this["actions"], object>;
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
    get __actionParams(): {
        pContext: Pc;
        context: Tc;
        map: E;
    };
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
    get __stateExtended(): StateExtended<Pc, Tc, ToEvents<E, P>>;
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
    get __state(): State<Tc, ToEventsR<E, P>>;
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
    get __stateP(): StateP<Tc, ToEventsR<E, P>["payload"]>;
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
    get __statePextended(): StatePextended<Pc, Tc, ToEventsR<E, P>["payload"]>;
    /**
     * @deprecated
     *
     * This property provides any guard key for this {@linkcode Machine} as a type.
     *
     * @remarks Used for typing purposes only.
     */
    get __guardKey(): keyof Extract<this["predicates"], object>;
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
    get __predictate(): PredicateS<E, P, Pc, Tc>;
    /**
     * @deprecated
     *
     * This property provides any delay key for this {@linkcode Machine} as a type.
     *
     * @remarks Used for typing purposes only.
     */
    get __delayKey(): keyof Extract<this["delays"], object>;
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
    get __delay(): Delay<E, P, Pc, Tc>;
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
    get __definedValue(): DefinedValue<Pc, Tc>;
    /**
     * @deprecated
     *
     * This property provides any promise key for this {@linkcode Machine} as a type.
     *
     * @remarks Used for typing purposes only.
     */
    get __src(): keyof Extract<this["promises"], object>;
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
    get __promise(): PromiseFunction<E, P, Pc, Tc>;
    /**
     * @deprecated
     *
     * This property provides any machine key for this {@linkcode Machine} as a type.
     *
     * @remarks Used for typing purposes only.
     */
    get __childKey(): keyof Extract<this["machines"], object>;
    /**
     * @deprecated
     *
     * Return this {@linkcode Machine} as a type.
     *
     * @remarks Used for typing purposes only.
     */
    get __machine(): this;
    /**
     * Creates an instance of Machine.
     *
     * @param config : of type {@linkcode Config} [C] - The configuration for the machine.
     *
     * @remarks
     * This constructor initializes the machine with the provided configuration.
     * It flattens the configuration and prepares it for further operations ({@linkcode preflat}).
     */
    constructor(config: C);
    /**
     * The accessor configuration of the machine for this {@linkcode Machine}.
     *
     * @see {@linkcode Config}
     * @see {@linkcode C}
     */
    get preConfig(): C;
    /**
     * The public accessor of the flat map of the configuration for this {@linkcode Machine}.
     *
     * @see {@linkcode FlatMapN}
     * @see {@linkcode Config}
     * @see {@linkcode C}
     */
    get preflat(): FlatMapN<C, true>;
    /**
     * The public accessor of Config of this {@linkcode Machine} after setting all initials {@linkcode StateValue}s.
     *
     * @see {@linkcode NodeConfigWithInitials}
     */
    get postConfig(): NodeConfigWithInitials;
    /**
     * Public accessor of initial {@linkcode StateValue}s for all compound {@linkcode NodeConfigWithInitials}.
     */
    get initials(): Mo["initials"];
    get targets(): Mo["targets"];
    /**
     * The accessor of context for this {@linkcode Machine}.
     *
     * @see {@linkcode types.PrimitiveObject}
     * @see {@linkcode Tc}
     */
    get context(): Tc;
    /**
     * The accessor of private context for this {@linkcode Machine}.
     *
     * @see {@linkcode Pc}
     */
    get pContext(): Pc;
    get actions(): Mo["actions"] | undefined;
    get predicates(): Mo["predicates"] | undefined;
    get delays(): Mo["delays"] | undefined;
    get promises(): Mo["promises"] | undefined;
    get machines(): Mo["machines"] | undefined;
    get postflat(): RecordS<NodeConfigWithInitials>;
    isInitial: (target: string) => boolean;
    retrieveParentFromInitial: (target: string) => NodeConfigWithInitials;
    /**
     * @deprecated
     * @remarks used internally
     */
    _provideValues: (values: Pick<Mo, "initials" | "targets">) => Machine<C, Pc, Tc, E, P, Mo>;
    /**
     * Provides options for the machine.
     *
     * @param option a function that provides options for the machine.
     * Options can include actions, predicates, delays, promises, and child machines.
     * @returns a new instance of the machine with the provided options applied.
     */
    provideOptions: (option: Parameters<(typeof this)["addOptions"]>[0]) => Machine<C, Pc, Tc, E, P, Mo>;
    /**
     * Returns a new instance from this {@linkcode Machine} with all its {@linkcode Elements}.
     */
    get renew(): Machine<C, Pc, Tc, E, P, Mo>;
    /**
     * @deprecated
     * @remarks used internally
     */
    _providePrivateContext: <T extends types.PrimitiveObject = types.PrimitiveObject>(pContext: T) => Machine<C, T, Tc, E, P, MachineOptions<C, E, P, T, Tc>>;
    addPrivateContext: (pContext: Pc) => void;
    /**
     * @deprecated
     * @remarks used internally
     */
    _provideContext: <T extends types.PrimitiveObject>(context: T) => Machine<C, Pc, T, E, P, MachineOptions<C, E, P, Pc, T>>;
    addContext: (context: Tc) => void;
    /**
     * @deprecated
     * @remarks used internally
     */
    _provideEvents: <T extends EventsMap>(map: T) => Machine<C, Pc, Tc, T, P, MachineOptions<C, T, P, Pc, Tc>>;
    /**
     * @deprecated
     * @remarks used internally
     */
    _providePromisees: <T extends PromiseeMap>(map: T) => Machine<C, Pc, Tc, E, T, MachineOptions<C, E, T, Pc, Tc>>;
    /**
     * Converts a {@linkcode StateValue} to a {@linkcode NodeConfigWithInitials} with the {@linkcode NodeConfigWithInitials} postConfig of this {@linkcode Machine}.
     *
     * @param from the {@linkcode StateValue} to convert.
     * @returns the converted {@linkcode NodeConfigWithInitials}.
     *
     * @see {@linkcode valueToNode}
     */
    valueToConfig: (from: StateValue) => NodeConfigWithInitials;
    /**
     * The accessor of the initial node config of this {@linkcode Machine}.
     */
    get initialConfig(): NodeConfigWithInitials;
    /**
     * The accessor of the initial {@linkcode StateValue} of this {@linkcode Machine}.
     *
     * @see {@linkcode nodeToValue}
     */
    get initialValue(): StateValue;
    /**
     * Alias of {@linkcode valueToConfig} method.
     */
    toNode: (from: StateValue) => NodeConfigWithInitials;
    get options(): Mo;
    /**
     * Provides options for the machine.
     *
     * @param option a function that provides options for the machine.
     * Options can include actions, predicates, delays, promises, and child machines.
     */
    addOptions: AddOptions_F<E, P, Pc, Tc, types.NOmit<Mo, 'initials' | 'targets'>>;
}
/**
 * Retrieves all entry actions from a node.
 */
export declare const getEntries: (node?: NodeConfigWithInitials | undefined) => import("../actions/index.js").ActionConfig[];
/**
 * Retrieves all exit actions from a node.
 */
export declare const getExits: (node?: NodeConfigWithInitials | undefined) => import("../actions/index.js").ActionConfig[];
export type { Machine };
export type CreateMachine_F = <const C extends Config = Config, Pc extends types.PrimitiveObject = types.PrimitiveObject, Tc extends types.PrimitiveObject = types.PrimitiveObject, EventM extends GetEventsFromConfig<C> = GetEventsFromConfig<C>, P extends PromiseeMap = GetPromiseeSrcFromConfig<C>, Mo extends MachineOptions<C, EventM, P, Pc, Tc> = MachineOptions<C, EventM, P, Pc, Tc>>(config: C, types: {
    pContext: Pc;
    context: Tc;
    eventsMap: EventM;
    promiseesMap: P;
}, values: Pick<Mo, 'initials' | 'targets'>) => Machine<C, Pc, Tc, EventM, P>;
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
export declare const createMachine: CreateMachine_F;
//# sourceMappingURL=machine.d.ts.map