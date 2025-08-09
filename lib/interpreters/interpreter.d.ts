import { type ActionConfig } from '../actions/index.js';
import { type EventArg, type EventArgT, type EventsMap, type PromiseeMap, type ToEvents } from '../events/index.js';
import { type GuardConfig } from '../guards/index.js';
import { type Machine } from '../machine/machine.js';
import { ChildS, type AnyMachine, type ChildS2, type Config, type ConfigFrom, type ContextFrom, type EventsMapFrom, type GetEventsFromConfig, type MachineConfig, type MachineOptions, type MachineOptionsFrom, type PrivateContextFrom, type PromiseesMapFrom, type SimpleMachineOptions2 } from '../machine/index.js';
import { Node, type NodeConfigWithInitials, type StateValue } from '../states/index.js';
import { type Interval2 } from '@bemedev/interval2';
import { type types } from '@bemedev/types';
import type { _Send_F, AddSubscriber_F, AnyInterpreter, CreateInterval2_F, Interpreter_F, Mode, Selector_F, State, WorkingStatus } from './interpreter.types';
import { type SubscriberClass } from './subscriber';
/**
 * The `Interpreter` class is responsible for interpreting and managing the state of a machine.
 * It provides methods to start, stop, pause, and resume the machine, as well as to send events
 * and subscribe to state changes.
 *
 * @template : type {@linkcode Config} [C] - The configuration type of the machine.
 * @template : [Pc] - The private context type, which can be any type.
 * @template : type {@linkcode types} [Tc] - The context type.
 * @template : type {@linkcode EventsMap} [E] - The events map type, which maps event names to their types.
 * @template : type {@linkcode PromiseeMap} [P] - The promisees map type, which maps promise names to their types.
 * @template Mo : type {@linkcode SimpleMachineOptions2} - The machine options type, which includes various configurations for the machine. Default to {@linkcode MachineOptions}.
 *
 * @implements : {@linkcode AnyInterpreter}
 *
 * @remarks
 * The `Interpreter` class is a core component of the state machine implementation,
 * allowing for the execution of state transitions, handling of events, and management of the machine's lifecycle.
 * It supports various modes of operation, including strict and normal modes,
 * and provides mechanisms for error and warning handling.
 * * It also allows for the execution of actions, predicates, and delays,
 * * as well as the management of child interpreters and scheduled tasks.
 *
 * @see {@linkcode GetEventsFromConfig} for extracting events from the machine configuration.
 */
export declare class Interpreter<const C extends Config = Config, Pc extends types.PrimitiveObject = types.PrimitiveObject, const Tc extends types.PrimitiveObject = types.PrimitiveObject, E extends EventsMap = GetEventsFromConfig<C>, P extends PromiseeMap = PromiseeMap, Mo extends SimpleMachineOptions2 = MachineOptions<C, E, P, Pc, Tc>> implements AnyInterpreter<E, P, Pc, Tc> {
    #private;
    /**
     * Public getter of the service subscribers of this {@linkcode Interpreter} service.
     */
    get children(): (AnyInterpreter2 & {
        id: string;
    })[];
    /**
     * Returns a service subscriber of this {@linkcode Interpreter} service with a specific id.
     * @param id - The id of the service subscriber to get.
     * @return The service subscriber {@linkcode AnyInterpreter2} of this {@linkcode Interpreter} service with the specified id, or undefined if not found.
     *
     * @see {@linkcode children} for all children.
     */
    getChildAt: (id: string) => (AnyInterpreter2 & {
        id: string;
    }) | undefined;
    /**
     * Allias of {@linkcode getChildAt} function.
     */
    at: (id: string) => (AnyInterpreter2 & {
        id: string;
    }) | undefined;
    /**
     * The id of the current {@linkcode Interpreter} service.
     * Used for child machines identification.
     */
    id?: string;
    /**
     * The accessor of {@linkcode Mode} of this {@linkcode Interpreter} service
     */
    get mode(): Mode;
    /**
     * @deprecated
     *
     * Used for typings only
     * The accessor of current {@linkcode ToEvents} of this {@linkcode Interpreter} service
     *
     * @remarks Usually for typings
     */
    get event(): ToEvents<E, P>;
    /**
     * The accessor of the map of events from the inner {@linkcode Machine}.
     */
    get eventsMap(): E;
    /**
     * The number of operations scheduled by the inner
     * //
     *
     * {@linkcode Scheduler.performeds} of this {@linkcode Interpreter} service.
     *
     * //
     *
     * @see {@linkcode Scheduler}
     */
    get scheduleds(): number;
    /**
     * Where everything is initialized
     * @param machine, the {@linkcode Machine} to interpret.
     * @param mode, the {@linkcode Mode} of the interpreter, default is 'strict'.
     * @param exact, whether to use exact intervals or not, default is false.
     */
    constructor(machine: Machine<C, Pc, Tc, E, P, Mo>, mode?: Mode, exact?: boolean);
    /**
     * Checks if the current {@linkcode Mode} mode is 'strict'.
     */
    get isStrict(): boolean;
    /**
     * Checks if the current {@linkcode Mode} mode is 'normal'.
     */
    get isNormal(): boolean;
    /**
     * Performs computations, after transitioning to the next target, to update the current {@linkcode NodeConfigWithInitials} config state of this {@linkcode Interpreter} service
     */
    protected _performConfig: () => void;
    protected _iterate: () => number;
    /**
     * The accessor of initial {@linkcode Node} of the inner {@linkcode Machine}.
     */
    get initialNode(): Node<E, P, Pc, Tc>;
    /**
     * The accessor of current {@linkcode Node} of this {@linkcode Interpreter} service.
     */
    get node(): Node<E, P, Pc, Tc>;
    /**
     * Set the current {@linkcode Mode} of this {@linkcode Interpreter} service to 'strict'.
     * In this mode, all errors are thrown and warnings are logged to the console.
     */
    makeStrict: () => void;
    /**
     * Set the current {@linkcode Mode} of this {@linkcode Interpreter} service to 'normal'.
     * In this mode, errors are logged to the console, but not thrown.
     */
    makeNormal: () => void;
    /**
     * The public accessor of initial {@linkcode WorkingStatus} status of the this {@linkcode Interpreter} service.
     */
    get status(): WorkingStatus;
    /**
     * The public accessor of initial {@linkcode NodeConfigWithInitials} of the inner {@linkcode Machine}.
     */
    get initialConfig(): NodeConfigWithInitials;
    /**
     * The public accessor of initial {@linkcode StateValue} of the inner {@linkcode Machine}.
     */
    get initialValue(): StateValue;
    /**
     * The public accessor of current {@linkcode NodeConfigWithInitials} config state of this {@linkcode Interpreter} service.
     */
    get config(): NodeConfigWithInitials;
    /**
     * Create a new {@linkcode Interpreter} instance with the same initial configuration as this instance.
     */
    get renew(): Interpreter<C, Pc, Tc, E, P, Mo>;
    /**
     * The public accessor of current {@linkcode StateValue}> of this {@linkcode Interpreter} service.
     */
    get value(): StateValue;
    /**
     * The public accessor of current {@linkcode Tc} context of this {@linkcode Interpreter} service.
     */
    get context(): Tc;
    /**
     * @deprecated
     * Just use for testing
     * @returns the current {@linkcode Pc} private context of this {@linkcode Interpreter} service.
     * @remarks returns nothing in prod
     *
     * @see {@linkcode context} to get the current context.
     */
    get _pContext(): Pc | undefined;
    /**
     * Select a path from the current {@linkcode Tc} context of this {@linkcode Interpreter} service.
     *
     * @param path, the key to select from the current {@linkcode Tc} context of this {@linkcode Interpreter} service.
     *
     * @returns the value from the path from the current {@linkcode Tc} context of this {@linkcode Interpreter} service.
     *
     * @see {@linkcode getByKey} for retrieving values by key.
     */
    get select(): Selector_F<Tc>;
    /**
     * @deprecated
     * Select a path from the current {@linkcode Pc} private context of this {@linkcode Interpreter} service.
     *
     * @param path, the key to select from the current {@linkcode Pc} private context of this {@linkcode Interpreter} service.
     *
     * @returns the value from the path from the current {@linkcode Pc} private context of this {@linkcode Interpreter} service.
     *
     * @remarks returns nothing in prod
     *
     * @see {@linkcode getByKey} for retrieving values by key.
     */
    get _pSelect(): Selector_F<Pc>;
    /**
     * Start this {@linkcode Interpreter} service.
     */
    start: () => Promise<void>;
    /**
     * Performs all self transitions and activities of this {@linkcode Interpreter} service.
     * @remarks Throw if the number of self transitions exceeds {@linkcode DEFAULT_MAX_SELF_TRANSITIONS}.
     */
    protected _next: () => Promise<void>;
    protected createInterval: CreateInterval2_F;
    /**
     * Collection of all currents {@linkcode Interval2} intervals, related to current {@linkcode ActivityConfig}s of this {@linkcode Interpreter} service.
     */
    protected _cachedIntervals: Interval2[];
    pause: () => void;
    resume: () => void;
    stop: () => void;
    /**
     * @deprecated
     * Used internally
     */
    _providePrivateContext: (pContext: Pc) => Machine<C, Pc, Tc, E, P, Mo>;
    /**
     * @deprecated
     * Used internally
     *
     * Alias of {@linkcode _providePrivateContext}
     */
    _ppC: (pContext: Pc) => Machine<C, Pc, Tc, E, P, Mo>;
    /**
     * @deprecated
     * Used internally
     */
    _provideContext: (context: Tc) => Machine<C, Pc, Tc, E, P, Mo>;
    /**
     * Add options to the inner {@linkcode Machine} of this {@linkcode Interpreter} service.
     */
    get addOptions(): import("../machine/index.js").AddOptions_F<E, P, Pc, Tc, types.NOmit<Mo, "targets" | "initials">>;
    get state(): Readonly<State<Tc, ToEvents<E, P>>>;
    subscribe: AddSubscriber_F<E, P, Tc>;
    /**
     * @deprecated
     * Just use for testing
     * @remarks returns nothing in prod
     */
    get _errorsCollector(): Set<string> | undefined;
    /**
     * @deprecated
     * Just use for testing
     * @remarks returns nothing in prod
     */
    get _warningsCollector(): Set<string> | undefined;
    protected _addError: (...errors: string[]) => void;
    protected _addWarning: (...warnings: string[]) => void;
    protected _send: _Send_F<E, P>;
    /**
     * Creates a sender function for the given event type.
     * @param type - the {@linkcode EventArgT} type of the event to send.
     * @returns a function with the payload as Parameter that sends the event with the given type and payload.
     *
     * @see {@linkcode send} for sending events directly.
     */
    sender: <T extends EventArgT<E>>(type: T) => (...data: object extends (Extract<import("../events/index.js")._EventsR<E>, {
        type: T;
    }> | Extract<types.Unionize<P> extends infer U extends PromiseeMap ? U extends any ? {
        type: `${keyof U & string}::then`;
        payload: U[keyof U]["then"];
    } | {
        type: `${keyof U & string}::catch`;
        payload: U[keyof U]["catch"];
    } : never : never, {
        type: T;
    }>)["payload"] ? [] : [(Extract<import("../events/index.js")._EventsR<E>, {
        type: T;
    }> | Extract<types.Unionize<P> extends infer U extends PromiseeMap ? U extends any ? {
        type: `${keyof U & string}::then`;
        payload: U[keyof U]["then"];
    } | {
        type: `${keyof U & string}::catch`;
        payload: U[keyof U]["catch"];
    } : never : never, {
        type: T;
    }>)["payload"]]) => void;
    /**
     * Sends an event to the current {@linkcode Interpreter} service.
     *
     * @param _event - the {@linkcode EventArg} event to send.
     *
     * @remarks
     * If the event cannot be performed, it will not be sent.
     * If the event is sent, it will be processed and the state will be updated.
     */
    send: (_event: EventArg<E>) => void;
    /**
     * Proposes the next configuration based on the current state value and the target.
     * @param target - the target state to propose the next configuration.
     * @returns the proposed next {@linkcode NodeConfigWithInitials} based on the current state value and the target.
     *
     * @remarks
     * Only proposes next config, does not change the current config.
     *
     * //
     *
     * @see {@linkcode Machine.valueToConfig} for more details.
     *
     * //
     */
    protected proposedNextConfig: (target: string) => NodeConfigWithInitials;
    toActionFn: (action: ActionConfig) => import("../types/index.js").FnR<E, P, Pc, Tc, {
        pContext?: (Pc extends types.Fn ? Pc : Pc extends object ? types.DeepPartial<Pc> : Pc) | undefined;
        context?: (Tc extends types.Fn ? Tc : Tc extends object ? types.DeepPartial<Tc> : Tc) | undefined;
    }> | undefined;
    toPredicateFn: (guard: GuardConfig) => import("../guards/index.js").PredicateS2<E, P, Pc, Tc> | undefined;
    toPromiseSrcFn: (src: string) => import("../promises/index.js").PromiseFunction2<E, P, Pc, Tc> | undefined;
    toDelayFn: (delay: string) => import("../types/index.js").FnR<E, P, Pc, Tc, number> | undefined;
    toMachine: (machine: MachineConfig) => (ChildS<E, P, Tc> & {
        id: string;
    }) | undefined;
    protected interpretChild: Interpreter_F;
    /**
     * Subscribes a child machine to the current machine.
     *
     * @param id - The unique identifier for the child machine.
     * @param {@linkcode ChildS2} - The child machine configuration to subscribe.
     * @returns a {@linkcode SubscriberClass} result of the child machine subscription.
     *
     */
    subscribeMachine: <T extends AnyMachine = AnyMachine>(id: string, { initials: _initials, ...rest }: ChildS2<E, P, Pc, Tc, T>) => SubscriberClass<Extract<T["eventsMap"], EventsMap>, Extract<T["promiseesMap"], PromiseeMap>, Extract<T["context"], types.PrimitiveObject>>;
    dispose: () => void;
    [Symbol.dispose]: () => void;
    [Symbol.asyncDispose]: () => Promise<void>;
}
export declare const TIME_TO_RINIT_SELF_COUNTER: number;
export type AnyInterpreter2 = Interpreter<any, any, any, any, any, any>;
/**
 * Retrieves the {@linkcode Interpreter} service from the given {@linkcode AnyMachine} machine.
 *
 * @template : type {@linkcode AnyMachine} [M] - The type of the machine from which to retrieve the interpreter.
 *
 * @see {@linkcode ConfigFrom}
 * @see {@linkcode PrivateContextFrom}
 * @see {@linkcode ContextFrom}
 * @see {@linkcode EventsMapFrom}
 * @see {@linkcode PromiseesMapFrom}
 * @see {@linkcode MachineOptionsFrom}
 */
export type InterpreterFrom<M extends AnyMachine> = Interpreter<ConfigFrom<M>, PrivateContextFrom<M>, ContextFrom<M>, EventsMapFrom<M>, PromiseesMapFrom<M>, MachineOptionsFrom<M>>;
export declare const _interpret: any;
/**
 * Creates an {@linkcode Interpreter} service from the given {@linkcode MachineConfig} machine.
 *
 * @param machine - The {@linkcode MachineConfig} machine to create the interpreter from.
 * @param options - The options for the interpreter, including context, private context, mode, and exact.
 * @returns an {@linkcode Interpreter} service.
 *
 * @see {@linkcode MachineConfig}
 */
export declare const interpret: Interpreter_F;
//# sourceMappingURL=interpreter.d.ts.map