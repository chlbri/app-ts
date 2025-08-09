'use strict';

var actions_functions_reduceAction = require('../actions/functions/reduceAction.cjs');
var actions_functions_toAction = require('../actions/functions/toAction.cjs');
require('../constants/errors.cjs');
var constants_numbers = require('../constants/numbers.cjs');
var constants_strings = require('../constants/strings.cjs');
var delays_functions_toDelay = require('../delays/functions/toDelay.cjs');
var events_constants = require('../events/constants.cjs');
var events_functions_eventToType = require('../events/functions/eventToType.cjs');
var events_functions_possibleEvents = require('../events/functions/possibleEvents.cjs');
var events_functions_transform = require('../events/functions/transform.cjs');
var decompose = require('@bemedev/decompose');
var equal = require('fast-deep-equal');
var utils_environment = require('../utils/environment.cjs');
var utils_merge = require('../utils/merge.cjs');
var utils_reduceFnMap = require('../utils/reduceFnMap.cjs');
var utils_strings_isStringEmpty = require('../utils/strings/isStringEmpty.cjs');
var utils_strings_replaceAll = require('../utils/strings/replaceAll.cjs');
require('../utils/typings.cjs');
require('../machine/functions/create.cjs');
var machine_functions_subcriber_contexts = require('../machine/functions/subcriber/contexts.cjs');
var machine_functions_subcriber_events = require('../machine/functions/subcriber/events.cjs');
var machine_functions_toMachine = require('../machine/functions/toMachine.cjs');
var machine_machine = require('../machine/machine.cjs');
var guards_functions_toPredicate = require('../guards/functions/toPredicate.cjs');
var promises_functions_src = require('../promises/functions/src.cjs');
var basifun = require('@bemedev/basifun');
var states_functions_flatMap = require('../states/functions/flatMap.cjs');
var states_functions_initialConfig = require('../states/functions/initialConfig.cjs');
var states_functions_nextSV = require('../states/functions/nextSV.cjs');
var states_functions_nodeToValue = require('../states/functions/nodeToValue.cjs');
var states_functions_resolveNode = require('../states/functions/resolveNode.cjs');
var primitives = require('../types/primitives.cjs');
var interval2 = require('@bemedev/interval2');
var sleep = require('@bemedev/sleep');
var types = require('@bemedev/types');
var cloneDeep = require('clone-deep');
var interpreters_scheduler = require('./scheduler.cjs');
var interpreters_subscriber = require('./subscriber.cjs');

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
class Interpreter {
    /**
     * The {@linkcode Machine} machine being interpreted.
     */
    #machine;
    /**
     * The current {@linkcode WorkingStatus} status of the this {@linkcode Interpreter} service.
     */
    #status = 'idle';
    /**
     * The current {@linkcode NodeConfigWithInitials} config state of this {@linkcode Interpreter} service.
     */
    #config;
    /**
     * The {@linkcode RecordS}<{@linkcode NodeConfigWithInitials}> flat representation of all possible config states of this {@linkcode Interpreter} service.
     */
    #flat;
    /**
     * The current {@linkcode StateValue}> of this {@linkcode Interpreter} service.
     */
    #value;
    /**
     * The {@linkcode Mode} of this {@linkcode Interpreter} service
     */
    #mode;
    /**
     * The initial {@linkcode Node} of the inner {@linkcode Machine}.
     */
    #initialNode;
    /**
     * The current {@linkcode Node} of this {@linkcode Interpreter} service.
     */
    #node;
    /**
     * an iiner ietrator to count the number of operations performed by this {@linkcode Interpreter} service.
     */
    #iterator = 0;
    /**
     * The current {@linkcode ToEvents} event of this {@linkcode Interpreter} service.
     */
    #event = events_constants.INIT_EVENT;
    /**
     * The initial {@linkcode NodeConfigWithInitials} of the inner {@linkcode Machine}.
     */
    #initialConfig;
    /**
     * The initial {@linkcode Pc} private context of this {@linkcode Interpreter} service.
     */
    #initialPpc;
    /**
     * The initial {@linkcode Tc} context of this {@linkcode Interpreter} service.
     */
    #initialContext;
    /**
     * The current {@linkcode Pc} private context of this {@linkcode Interpreter} service.
     */
    #pContext;
    /**
     * The current {@linkcode Tc} context of this {@linkcode Interpreter} service.
     */
    #context;
    /**
     * The {@linkcode Scheduler} of this {@linkcode Interpreter} service.
     */
    #scheduler;
    /**
     * The previous {@linkcode State} of this {@linkcode Interpreter} service.
     */
    #previousState;
    /**
     * The current {@linkcode State} of this {@linkcode Interpreter} service.
     */
    #state;
    /**
     * All {@linkcode AnyInterpreter2} service subscribers of this {@linkcode Interpreter} service.
     */
    #childrenServices = [];
    /**
     * Public getter of the service subscribers of this {@linkcode Interpreter} service.
     */
    get children() {
        return this.#childrenServices;
    }
    /**
     * Returns a service subscriber of this {@linkcode Interpreter} service with a specific id.
     * @param id - The id of the service subscriber to get.
     * @return The service subscriber {@linkcode AnyInterpreter2} of this {@linkcode Interpreter} service with the specified id, or undefined if not found.
     *
     * @see {@linkcode children} for all children.
     */
    getChildAt = (id) => this.children.find(f => f.id === id);
    /**
     * Allias of {@linkcode getChildAt} function.
     */
    at = this.getChildAt;
    /**
     * Returns all child machines of this {@linkcode Interpreter}.
     *
     * @see {@linkcode toArray.typed} for converting the machines to an array.
     * @see {@linkcode toMachine} for converting the machine config to a {@linkcode Machine}.
     * @see {@linkcode isDefined} for filtering out undefined machines.
     */
    get #childrenMachines() {
        const _machines = basifun.toArray.typed(this.#machine.preConfig.machines);
        return _machines.map(this.toMachine).filter(basifun.isDefined);
    }
    /**
     * The id of the current {@linkcode Interpreter} service.
     * Used for child machines identification.
     */
    id;
    /**
     * The accessor of {@linkcode Mode} of this {@linkcode Interpreter} service
     */
    get mode() {
        return this.#mode;
    }
    /**
     * @deprecated
     *
     * Used for typings only
     * The accessor of current {@linkcode ToEvents} of this {@linkcode Interpreter} service
     *
     * @remarks Usually for typings
     */
    get event() {
        return this.#event;
    }
    /**
     * The accessor of the map of events from the inner {@linkcode Machine}.
     */
    get eventsMap() {
        return this.#machine.eventsMap;
    }
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
    get scheduleds() {
        return this.#scheduler.performeds;
    }
    /**
     * Where everything is initialized
     * @param machine, the {@linkcode Machine} to interpret.
     * @param mode, the {@linkcode Mode} of the interpreter, default is 'strict'.
     * @param exact, whether to use exact intervals or not, default is false.
     */
    constructor(machine, mode = 'strict', exact = true) {
        this.#machine = machine.renew;
        this.#config = this.#initialConfig = this.#machine.initialConfig;
        this.#initialNode = this.#resolveNode(this.#initialConfig);
        this.#mode = mode;
        this.#exact = exact;
        this.#performConfig(true);
        this.#scheduler = new interpreters_scheduler.Scheduler();
        this.#state = this.#previousState = {
            status: this.#status,
            context: this.#context,
            event: events_constants.INIT_EVENT,
            value: this.#value,
            tags: this.#config.tags,
        };
        this.#throwing();
    }
    /**
     * Checks if the current {@linkcode Mode} mode is 'strict'.
     */
    get isStrict() {
        return this.#mode === 'strict';
    }
    /**
     * Checks if the current {@linkcode Mode} mode is 'normal'.
     */
    get isNormal() {
        return this.#mode === 'normal';
    }
    /**
     * Use to manage internal errors and warnings.
     */
    #throwing = () => {
        if (this.isStrict) {
            const check1 = this.#warningsCollector.size > 0;
            if (check1) {
                const warnings = this.#displayConsole(this.#warningsCollector);
                console.log(warnings);
            }
            /* v8 ignore next 5 */
            const check2 = this.#errorsCollector.size > 0;
            if (check2) {
                const errors = this.#displayConsole(this.#errorsCollector);
                throw new Error(errors);
            }
            return;
        }
        if (this.isNormal) {
            const check3 = this.#errorsCollector.size > 0;
            if (check3) {
                const errors = this.#displayConsole(this.#errorsCollector);
                console.error(errors);
            }
            /* v8 ignore next 8 */
            const check4 = this.#warningsCollector.size > 0;
            if (check4) {
                const warnings = this.#displayConsole(this.#warningsCollector);
                console.log(warnings);
            }
            return;
        }
    };
    /**
     * Assign the current {@linkcode State} and the previous {@linkcode State} of the {@linkcode Interpreter} service and flush all subscribers.
     * @param parts, Partial {@linkcode State}
     *
     * @see {@linkcode SubscriberClass}
     * @see {@linkcode SubscriberClass}
     */
    #performStates = (parts) => {
        this.#previousState = cloneDeep(this.#state);
        this.#state = { ...this.#state, ...parts };
        this.#flush();
    };
    /**
     * Performs computations, after transitioning to the next target, to update the current {@linkcode NodeConfigWithInitials} config state of this {@linkcode Interpreter} service
     */
    _performConfig = () => {
        const value = states_functions_nodeToValue.nodeToValue(this.#config);
        this.#value = value;
        this.#performStates({ value });
        this.#node = this.#resolveNode(this.#config);
        const configForFlat = types.castings.commons.unknown(this.#config);
        this.#flat = types.castings.commons.any(states_functions_flatMap.flatMap(configForFlat));
    };
    /**
     * Performs computations, to update the current {@linkcode NodeConfigWithInitials} config state of this {@linkcode Interpreter} service
     * @param target, the target to perform the config for.
     */
    #performConfig = (target) => {
        if (target === true)
            return this._performConfig();
        if (target) {
            this.#config = this.proposedNextConfig(target);
            const tags = this.#config.tags;
            this.#performStates({ tags });
            return this._performConfig();
        }
    };
    _iterate = () => this.#iterator++;
    /**
     * Resolves a {@linkcode Node} from the given {@linkcode NodeConfigWithInitials} configuration.
     *
     * @param config of type {@linkcode NodeConfigWithInitials}, the configuration to resolve.
     *
     * @returns a {@linkcode Node} resolved from the configuration.
     *
     * @see {@linkcode resolveNode} for the actual resolution logic.
     * @see {@linkcode E}
     * @see {@linkcode P}
     * @see {@linkcode Pc}
     * @see {@linkcode Tc}
     */
    #resolveNode = (config) => {
        const options = this.#machine.options;
        const events = this.#machine.eventsMap;
        const promisees = this.#machine.promiseesMap;
        return states_functions_resolveNode.resolveNode(events, promisees, config, options);
    };
    /**
     * The accessor of initial {@linkcode Node} of the inner {@linkcode Machine}.
     */
    get initialNode() {
        return this.#initialNode;
    }
    /**
     * The accessor of current {@linkcode Node} of this {@linkcode Interpreter} service.
     */
    get node() {
        return this.#node;
    }
    /**
     * Set the current {@linkcode Mode} of this {@linkcode Interpreter} service to 'strict'.
     * In this mode, all errors are thrown and warnings are logged to the console.
     */
    makeStrict = () => {
        this.#mode = 'strict';
    };
    /**
     * Set the current {@linkcode Mode} of this {@linkcode Interpreter} service to 'normal'.
     * In this mode, errors are logged to the console, but not thrown.
     */
    makeNormal = () => {
        this.#mode = 'normal';
    };
    /**
     * The public accessor of initial {@linkcode WorkingStatus} status of the this {@linkcode Interpreter} service.
     */
    get status() {
        return this.#status;
    }
    /**
     * The public accessor of initial {@linkcode NodeConfigWithInitials} of the inner {@linkcode Machine}.
     */
    get initialConfig() {
        return this.#initialConfig;
    }
    /**
     * The public accessor of initial {@linkcode StateValue} of the inner {@linkcode Machine}.
     */
    get initialValue() {
        return this.#machine.initialValue;
    }
    /**
     * The public accessor of current {@linkcode NodeConfigWithInitials} config state of this {@linkcode Interpreter} service.
     */
    get config() {
        return this.#config;
    }
    /**
     * Create a new {@linkcode Interpreter} instance with the same initial configuration as this instance.
     */
    get renew() {
        const out = new Interpreter(this.#machine);
        out._ppC(this.#initialPpc);
        out._provideContext(this.#initialContext);
        return out;
    }
    /**
     * The public accessor of current {@linkcode StateValue}> of this {@linkcode Interpreter} service.
     */
    get value() {
        return this.#value;
    }
    /**
     * The public accessor of current {@linkcode Tc} context of this {@linkcode Interpreter} service.
     */
    get context() {
        return this.#context;
    }
    /**
     * @deprecated
     * Just use for testing
     * @returns the current {@linkcode Pc} private context of this {@linkcode Interpreter} service.
     * @remarks returns nothing in prod
     *
     * @see {@linkcode context} to get the current context.
     */
    get _pContext() {
        if (utils_environment.IS_TEST) {
            return this.#pContext;
            /* v8 ignore next 4 */
        }
        console.error('pContext is not available in production');
        return;
    }
    /**
     * Select a path from the current {@linkcode Tc} context of this {@linkcode Interpreter} service.
     *
     * @param path, the key to select from the current {@linkcode Tc} context of this {@linkcode Interpreter} service.
     *
     * @returns the value from the path from the current {@linkcode Tc} context of this {@linkcode Interpreter} service.
     *
     * @see {@linkcode getByKey} for retrieving values by key.
     */
    get select() {
        const check = types.castings.commons.primitive.is(this.#context);
        if (check)
            return undefined;
        const out = (path) => machine_functions_subcriber_contexts.getByKey(this.#context, path);
        return out;
    }
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
    get _pSelect() {
        if (utils_environment.IS_TEST) {
            const pContext = this.#pContext;
            const check = types.castings.commons.primitive.is(pContext);
            if (check)
                return undefined;
            if (pContext) {
                const out = (path) => machine_functions_subcriber_contexts.getByKey(pContext, path);
                return out;
            }
            /* v8 ignore next 4 */
        }
        console.error('pContext is not available in production');
        return undefined;
    }
    /**
     * Set the current {@linkcode WorkingStatus} private context of this {@linkcode Interpreter} service.
     * @returns 'started'.
     */
    #startStatus = () => this.#setStatus('started');
    /**
     * Helper to format inner errors and warnings.
     * @param messages - an iterable of messages to format.
     * @returns an array of messages joined by new line.
     *
     * @remarks Used to display console messages in a readable format.
     */
    #displayConsole = (messages) => {
        return Array.from(messages).join('\n');
    };
    /**
     * Flushes all subscribers and map subscribers of this {@linkcode Interpreter} service.
     *
     * @see {@linkcode SubscriberClass} for more information about subscribers.
     * @see {@linkcode SubscriberClass} for more information about map subscribers.
     */
    #flush = () => {
        this.#flushMapSubscribers();
    };
    /**
     * All actions that are currently scheduled to be performed.
     * @returns an array of {@linkcode Timeout2} that are currently scheduled to be performed.
     */
    #timeoutActions = [];
    /**
     * Start this {@linkcode Interpreter} service.
     */
    start = () => {
        this.#throwing();
        this.#flush();
        this.#startStatus();
        this.#scheduler.initialize(this.#startInitialEntries);
        this.#performChildMachines();
        this.#throwing();
        return this._next();
    };
    /**
     * Pause the collection of all currents {@linkcode Interval2} intervals, related to current {@linkcode ActivityConfig}s of this {@linkcode Interpreter} service.
     *
     * @see {@linkcode Scheduler} for more information about scheduling.
     */
    #pauseAllActivities = () => {
        this._cachedIntervals.forEach(this.#pause);
    };
    /**
     * Schedule all activities of the current {@linkcode Node} of this {@linkcode Interpreter} service.
     *
     * @see {@linkcode Scheduler} for more information about scheduling.
     */
    get #schedule() {
        return this.#scheduler.schedule;
    }
    /**
     * Used to track number of self transitions
     */
    #selfTransitionsCounter = 0;
    /**
     * Performs all self transitions and activities of this {@linkcode Interpreter} service.
     */
    #next = async () => {
        this.#selfTransitionsCounter++;
        this.#pauseAllActivities();
        this.#performActivities();
        await this.#performSelfTransitions();
    };
    /**
     * Performs all self transitions and activities of this {@linkcode Interpreter} service.
     * @remarks Throw if the number of self transitions exceeds {@linkcode DEFAULT_MAX_SELF_TRANSITIONS}.
     */
    _next = async () => {
        let check = false;
        do {
            const startTime = Date.now();
            const previousValue = this.#value;
            const checkCounter = this.#selfTransitionsCounter >= constants_numbers.DEFAULT_MAX_SELF_TRANSITIONS;
            if (checkCounter)
                return this.#throwMaxCounter();
            this.#throwing();
            await this.#next();
            const currentValue = this.#value;
            check = !equal(previousValue, currentValue);
            if (check) {
                this.#flush();
            }
            const duration = Date.now() - startTime;
            const check2 = duration > TIME_TO_RINIT_SELF_COUNTER;
            if (check2)
                this.#selfTransitionsCounter = 0;
        } while (check);
        this.#selfTransitionsCounter = 0;
    };
    get #cloneState() {
        const pContext = structuredClone(this.#pContext);
        return structuredClone({ pContext, ...this.#state });
    }
    #performAction = action => {
        this._iterate();
        return action(this.#cloneState);
    };
    #performScheduledAction = (scheduled) => {
        if (!scheduled)
            return;
        const { data, ms: timeout, id } = scheduled;
        const callback = () => {
            const cb = () => this.#mergeContexts(data);
            this.#schedule(cb);
        };
        this.#timeoutActions.filter(f => f.id === id).forEach(this.#dispose);
        this.#timeoutActions = this.#timeoutActions.filter(f => f.id !== id);
        const timer = interval2.createTimeout({ callback, timeout, id });
        this.#timeoutActions.push(timer);
        timer.start();
    };
    #performSendToAction = (sentEvent) => {
        if (!sentEvent)
            return;
        this.#sendTo(sentEvent.to, sentEvent.event);
    };
    #performResendAction = (resend) => {
        if (!resend)
            return;
        const cannot = this.#cannotPerformEvents(resend);
        if (cannot)
            return;
        return this.send(resend);
    };
    /**
     * Force transition to performs inner actions despite the current state.
     * This is useful for sending events that are not part of the current state transitions.
     * @param transitions, the transitions to perform.
     * @returns the result of the transitions.
     *
     * @see {@linkcode TransitionConfig} for more information about transitions.
     */
    #performForceSendAction = (forceSend) => {
        if (!forceSend)
            return;
        const values = Object.values(this.#machine.preflat);
        values.forEach(({ on }) => {
            const type = events_functions_eventToType.eventToType(forceSend);
            const transitions = basifun.toArray.typed(on?.[type]);
            this.#performTransitions(...transitions);
        });
    };
    #performPauseActivityAction = (id) => {
        if (!id)
            return;
        this.#currentActivities?.filter(f => f.id === id).forEach(this.#pause);
    };
    #performResumeActivityAction = (id) => {
        if (!id)
            return;
        this.#currentActivities
            ?.filter(f => f.id === id)
            .forEach(this.#resume);
    };
    #performStopActivityAction = (id) => {
        if (!id)
            return;
        this.#currentActivities
            ?.filter(f => f.id === id)
            .forEach(this.#dispose);
    };
    #performPauseTimerAction = (id) => {
        if (!id)
            return;
        this.#timeoutActions.filter(f => f.id === id).forEach(this.#pause);
    };
    #performResumeTimerAction = (id) => {
        if (!id)
            return;
        this.#timeoutActions.filter(f => f.id === id).forEach(this.#resume);
    };
    #performStopTimerAction = (id) => {
        if (!id)
            return;
        this.#timeoutActions.filter(f => f.id === id).forEach(this.#stop);
    };
    #performsExtendedActions = ({ forceSend, resend, scheduled, pauseActivity, resumeActivity, stopActivity, pauseTimer, resumeTimer, stopTimer, sentEvent, }) => {
        this.#performSendToAction(sentEvent);
        this.#performScheduledAction(scheduled);
        this.#performPauseActivityAction(pauseActivity);
        this.#performResumeActivityAction(resumeActivity);
        this.#performStopActivityAction(stopActivity);
        this.#performPauseTimerAction(pauseTimer);
        this.#performResumeTimerAction(resumeTimer);
        this.#performStopTimerAction(stopTimer);
        // ForceSendAction returns the result to make further actions
        const result = this.#performForceSendAction(forceSend) ??
            this.#performResendAction(resend);
        return result;
    };
    #executeAction = action => {
        this.#makeBusy();
        const { pContext, context, ...extendeds } = this.#performAction(action);
        this.#mergeContexts({ pContext, context });
        this.#performsExtendedActions(extendeds);
    };
    /**
     * Throws if the number of self transitions exceeds {@linkcode DEFAULT_MAX_SELF_TRANSITIONS}.
     */
    #throwMaxCounter() {
        const error = `Too much self transitions, exceeded ${constants_numbers.DEFAULT_MAX_SELF_TRANSITIONS} transitions`;
        if (utils_environment.IS_TEST) {
            this._addError(error);
            this.#throwing();
            this.stop();
            /* v8 ignore next 1 */
        }
        else
            throw error;
    }
    // get #contexts() {
    //   return castings.commons<ActionResult<Pc, Tc>>({
    //     pContext: cloneDeep(this.#pContext),
    //     context: structuredClone(this.#context),
    //   });
    // }
    #performActions = (...actions) => {
        actions
            .map(this.toActionFn)
            .filter(f => f !== undefined)
            .forEach(this.#executeAction);
    };
    #performPredicate = predicate => {
        this._iterate();
        return predicate(this.#cloneState);
    };
    #executePredicate = predicate => {
        this.#makeBusy();
        const out = this.#performPredicate(predicate);
        this.#makeWork();
        return out;
    };
    #performPredicates = (...guards) => {
        if (guards.length < 1)
            return true;
        return guards
            .map(this.toPredicateFn)
            .filter(basifun.isDefined)
            .map(this.#executePredicate)
            .every(b => b);
    };
    #performDelay = delay => {
        this._iterate();
        return delay(this.#cloneState);
    };
    #executeDelay = delay => {
        this.#makeBusy();
        const out = this.#performDelay(delay);
        this.#startStatus();
        return out;
    };
    #flushMapSubscribers = () => {
        this.#subscribers.forEach(f => {
            const callback = () => f.fn(this.#previousState, this.#state);
            this.#schedule(callback);
        });
    };
    #mergeContexts = (result) => {
        this.#pContext = utils_merge.merge(this.#pContext, result?.pContext);
        const context = utils_merge.merge(this.#context, result?.context);
        this.#context = context;
        this.#performStates({ context });
        this.#flush();
    };
    #executeActivities = (from, _activities) => {
        const entries = Object.entries(_activities);
        const outs = [];
        for (const [_delay, _activity] of entries) {
            const id = `${from}::${_delay}`;
            const _interval = this._cachedIntervals.find(f => f.id === id);
            if (_interval) {
                outs.push(id);
                continue;
            }
            const delayF = this.toDelayFn(_delay);
            const check0 = !basifun.isDefined(delayF);
            if (check0)
                return [];
            const interval = this.#executeDelay(delayF);
            const check11 = interval < constants_numbers.DEFAULT_MIN_ACTIVITY_TIME;
            if (check11) {
                this._addWarning(`Delay (${_delay}) is too short`);
                return [];
            }
            const check12 = interval > constants_numbers.DEFAULT_MAX_TIME_PROMISE;
            if (check12) {
                this._addWarning(`Delay (${_delay}) is too long`);
                return [];
            }
            const activities = basifun.toArray.typed(_activity);
            const callback = () => {
                const cb = () => {
                    for (const activity of activities) {
                        const check2 = typeof activity === 'string';
                        const check3 = primitives.isDescriber(activity);
                        const check4 = check2 || check3;
                        if (check4) {
                            this.#performActions(activity);
                            continue;
                        }
                        const check5 = this.#performPredicates(...basifun.toArray.typed(activity.guards));
                        if (check5) {
                            const actions = basifun.toArray.typed(activity.actions);
                            this.#performActions(...actions);
                        }
                    }
                };
                this.#schedule(cb);
            };
            const promise = this.createInterval({
                callback,
                interval,
                id,
            });
            this._cachedIntervals.push(promise);
            outs.push(id);
        }
        return outs;
    };
    #exact;
    createInterval = ({ callback, id, interval, }) => {
        const exact = this.#exact;
        const out = interval2.createInterval({
            callback,
            id,
            interval,
            exact,
        });
        return out;
    };
    /**
     * Collection of all currents {@linkcode Interval2} intervals, related to current {@linkcode ActivityConfig}s of this {@linkcode Interpreter} service.
     */
    _cachedIntervals = [];
    #performTransition = transition => {
        const { guards, actions, target } = transition;
        const { diffEntries, diffExits } = this.#diffNext(target);
        const response = this.#performPredicates(...basifun.toArray(guards));
        if (response) {
            this.#performActions(...basifun.toArray(diffExits));
            this.#performActions(...basifun.toArray(actions));
            this.#performActions(...basifun.toArray(diffEntries));
            return target ?? false;
        }
        return false;
    };
    #performTransitions = (...transitions) => {
        // let transition: ReturnType<PerformTransition_F<Pc, Tc>> = false;
        for (const _transition of transitions) {
            const transition = this.#performTransition(_transition);
            const check1 = typeof transition === 'string';
            if (check1)
                return transition;
        }
        return false;
    };
    #performPromiseSrc = promise => {
        this._iterate();
        return promise(this.#cloneState);
    };
    #performFinally = (_finally) => {
        const check1 = _finally === undefined;
        if (check1)
            return;
        const finals = basifun.toArray.typed(_finally);
        for (const final of finals) {
            const check2 = typeof final === 'string';
            const check3 = primitives.isDescriber(final);
            const check4 = check2 || check3;
            if (check4) {
                this.#performActions(final);
                continue;
            }
            const response = this.#performPredicates(...basifun.toArray.typed(final.guards));
            if (response) {
                this.#performActions(...basifun.toArray.typed(final.actions));
            }
        }
        return;
    };
    get #sending() {
        return this.#status === 'sending';
    }
    #performPromisee = (from, ...promisees) => {
        const promises = [];
        promisees.forEach(({ src, then, catch: _catch, finally: _finally, max: maxS }) => {
            const promiseF = this.toPromiseSrcFn(src);
            if (!promiseF)
                return;
            const handlePromise = (type, payload) => {
                const out = () => {
                    const event = {
                        type: `${src}::${type}`,
                        payload,
                    };
                    this.#changeEvent(types.castings.commons.any(event));
                    const transitions = basifun.toArray.typed(type === 'then' ? then : _catch);
                    const target = this.#performTransitions(...transitions);
                    this.#performFinally(_finally);
                    return { event: this.#event, target };
                };
                if (this.#cannotPerform(from))
                    return;
                return out();
            };
            const _promise = () => this.#performPromiseSrc(promiseF)
                .then(basifun.partialCall(handlePromise, 'then'))
                .catch(basifun.partialCall(handlePromise, 'catch'));
            const MAX_POMS = [constants_numbers.DEFAULT_MAX_TIME_PROMISE];
            const check3 = basifun.isDefined(maxS);
            if (check3) {
                const delayF = this.toDelayFn(maxS);
                const check4 = !basifun.isDefined(delayF);
                if (check4)
                    return this.#throwing();
                const max = this.#performDelay(delayF);
                MAX_POMS.push(max);
            }
            const promise = basifun.withTimeout.safe(_promise, from, ...MAX_POMS);
            promises.push(promise);
        });
        const check5 = promises.length < 1;
        if (check5)
            return;
        const promise = basifun.anyPromises(from, ...promises);
        return promise;
    };
    /**
     * Checks if sent events cannot be performed.
     * @param from - the config value from which the events are sent.
     * @returns true if the events cannot be performed, false otherwise.
     */
    #cannotPerform = (from) => {
        const check = this.#sending || !this.#isInsideValue(from);
        return check;
    };
    #performAfter = (from, after) => {
        const entries = Object.entries(after);
        const promises = [];
        entries.forEach(([_delay, transition]) => {
            const delayF = this.toDelayFn(_delay);
            const check0 = !basifun.isDefined(delayF);
            if (check0)
                return;
            const delay = this.#executeDelay(delayF);
            const check1 = delay > constants_numbers.DEFAULT_MAX_TIME_PROMISE;
            if (check1) {
                this._addWarning(`Delay ${_delay} is too long`);
                return;
            }
            const transitions = basifun.toArray.typed(transition);
            const _promise = async () => {
                await sleep(delay);
                const func = () => this.#performTransitions(...transitions);
                if (this.#cannotPerform(from))
                    return false;
                const out = func();
                if (out === false) {
                    const message = `No transitions reached from "${from}" by delay "${_delay}" !`;
                    throw message;
                }
                return out;
            };
            const promise = basifun.withTimeout(_promise, from, constants_numbers.DEFAULT_MAX_TIME_PROMISE);
            promises.push(promise);
        });
        const check5 = promises.length < 1;
        if (check5)
            return;
        const promise = basifun.anyPromises(from, ...promises);
        return promise;
    };
    #performAlways = alway => {
        const always = basifun.toArray(alway);
        return this.#performTransitions(...always);
    };
    get #collectedPromisees() {
        const entriesFlat = Object.entries(this.#flat);
        const entries = [];
        entriesFlat.forEach(([from, node]) => {
            const promisees = basifun.toArray.typed(node.promises);
            if (node.promises) {
                entries.push([from, ...promisees]);
            }
        });
        return entries;
    }
    get #collectedActivities() {
        const entriesFlat = Object.entries(this.#flat);
        const entries = [];
        entriesFlat.forEach(([from, { activities }]) => {
            if (activities) {
                entries.push([from, activities]);
            }
        });
        return entries;
    }
    get #collectedAfters() {
        const entriesFlat = Object.entries(this.#flat);
        const entries = [];
        entriesFlat.forEach(([from, node]) => {
            const after = node.after;
            if (after) {
                entries.push([from, after]);
            }
        });
        return entries;
    }
    get #collectedAlways() {
        const entriesFlat = Object.entries(this.#flat);
        const entries = [];
        entriesFlat.forEach(([from, node]) => {
            const always = node.always;
            if (always) {
                entries.push([from, always]);
            }
        });
        return entries;
    }
    get #currentActivities() {
        const collected = this.#collectedActivities;
        const check = collected.length < 1;
        if (check)
            return;
        const ids = [];
        for (const args of collected) {
            ids.push(...this.#executeActivities(...args));
        }
        return this._cachedIntervals.filter(({ id }) => ids.includes(id));
    }
    #performActivities = () => {
        return this.#currentActivities?.forEach(this.#start);
    };
    #performChildMachines = () => {
        this.#childrenMachines.forEach(({ id, ...child }) => {
            this.#reduceChild(types.castings.commons.any(child), id);
        });
        this.#childrenServices.forEach(child => {
            child.start();
        });
    };
    /**
     * Get all brut self transitions of the current {@linkcode NodeConfigWithInitials} config state of this {@linkcode Interpreter} service.
     */
    get #collectedSelfTransitions0() {
        const entries = new Map();
        this.#collectedAlways.forEach(([from, always]) => {
            entries.set(from, { always: () => this.#performAlways(always) });
        });
        this.#collectedAfters.forEach(([from, after]) => {
            const inner = entries.get(from);
            if (inner) {
                inner.after = this.#performAfter(from, after);
            }
            else
                entries.set(from, { after: this.#performAfter(from, after) });
        });
        this.#collectedPromisees.forEach(([from, ...promisees]) => {
            const inner = entries.get(from);
            if (inner) {
                inner.promisee = this.#performPromisee(from, ...promisees);
            }
            else {
                entries.set(from, {
                    promisee: this.#performPromisee(from, ...promisees),
                });
            }
        });
        return entries;
    }
    /**
     * Changes the current {@linkcode ToEvents} event of this {@linkcode Interpreter} service.
     *
     * @param event - the {@linkcode ToEvents} event to change the current {@linkcode Interpreter} service state.
     */
    #changeEvent = (event) => {
        this.#performStates({ event });
        this.#event = event;
    };
    get #collectedSelfTransitions() {
        const entries = Array.from(this.#collectedSelfTransitions0);
        const out = entries.map(([from, { after, always, promisee }]) => {
            const promise = async () => {
                if (always) {
                    const target = always();
                    if (target !== false) {
                        const cb = () => {
                            this.#performConfig(target);
                        };
                        return this.#schedule(cb);
                    }
                }
                const promises = [];
                if (after) {
                    const _after = async () => {
                        await after()
                            .then(transition => {
                            if (transition !== false) {
                                const cb = () => {
                                    this.#performConfig(transition);
                                };
                                this.#schedule(cb);
                            }
                        })
                            .catch(this._addWarning);
                    };
                    promises.push(basifun.withTimeout(_after, 'after'));
                }
                if (promisee) {
                    const _promisee = async () => {
                        return promisee().then(transition => {
                            const target = transition?.target;
                            if (target !== false) {
                                const cb = () => this.#performConfig(target);
                                this.#schedule(cb);
                            }
                        });
                    };
                    promises.push(basifun.withTimeout(_promisee, 'promisee'));
                }
                const check1 = promises.length < 1;
                if (check1)
                    return;
                await basifun.anyPromises(from, ...promises)();
            };
            return promise;
        });
        return out;
    }
    #performSelfTransitions = async () => {
        this.#makeBusy();
        const state1 = structuredClone(this.#state);
        await Promise.all(this.#collectedSelfTransitions.map(f => f()));
        const state2 = structuredClone(this.#state);
        const check = !equal(state1, state2);
        if (check) {
            this.#flush();
        }
        this.#makeWork();
    };
    #startInitialEntries = () => {
        const actions = machine_machine.getEntries(this.#initialConfig);
        if (actions.length < 1)
            return;
        const cb = () => this.#performActions(...actions);
        this.#schedule(cb);
    };
    /**
     * @deprecated
     * A mapper function that returns a function to call a method on a value.
     * @param key - the key of the method to be called on the value.
     * @returns a function that calls the method on the value.
     *
     * @see {@linkcode AllowedNames} for more information about allowed names.
     * @see {@linkcode Fn} for more information about function types.
     */
    #mapperFn = (key) => {
        return (value) => {
            const fn = value[key];
            this.#schedule(fn);
        };
    };
    #pause = this.#mapperFn('pause');
    #open = this.#mapperFn('open');
    #start = this.#mapperFn('start');
    #close = this.#mapperFn('close');
    #resume = this.#mapperFn('resume');
    #unsubscribe = this.#mapperFn('unsubscribe');
    #stop = this.#mapperFn('stop');
    #dispose = this.#mapperFn('dispose');
    pause = () => {
        this.#pauseAllActivities();
        this.#makeBusy();
        this.#subscribers.forEach(this.#close);
        this.#childrenServices.forEach(this.#pause);
        this.#timeoutActions.forEach(this.#pause);
        this.#setStatus('paused');
    };
    resume = () => {
        if (this.#status === 'paused') {
            this.#performActivities();
            this.#makeBusy();
            this.#subscribers.forEach(this.#open);
            this.#timeoutActions.forEach(this.#resume);
            this.#childrenServices.forEach(this.#resume);
            this.#makeWork();
        }
    };
    stop = () => {
        this.pause();
        this.#makeBusy();
        this.#subscribers.forEach(this.#unsubscribe);
        this.#childrenServices.forEach(this.#stop);
        this._cachedIntervals.forEach(this.#dispose);
        this.#timeoutActions.forEach(this.#stop);
        this.#scheduler.stop();
        this.#setStatus('stopped');
    };
    #makeBusy = () => {
        return this.#setStatus('busy');
    };
    #setStatus = (status) => {
        this.#performStates({ status });
        return (this.#status = status);
    };
    #startingStatus = () => {
        return this.#setStatus('starting');
    };
    /**
     * @deprecated
     * Used internally
     */
    _providePrivateContext = (pContext) => {
        this.#initialPpc = this.#pContext = pContext;
        this.#makeBusy();
        this.#machine.addPrivateContext(this.#initialPpc);
        this.#startingStatus();
        return this.#machine;
    };
    /**
     * @deprecated
     * Used internally
     *
     * Alias of {@linkcode _providePrivateContext}
     */
    _ppC = this._providePrivateContext;
    /**
     * @deprecated
     * Used internally
     */
    _provideContext = (context) => {
        this.#initialContext = this.#context = context;
        this.#performStates({ context });
        this.#makeBusy();
        this.#machine.addContext(this.#initialContext);
        this.#startingStatus();
        return this.#machine;
    };
    /**
     * Add options to the inner {@linkcode Machine} of this {@linkcode Interpreter} service.
     */
    get addOptions() {
        return this.#machine.addOptions;
    }
    #subscribers = new Set();
    get state() {
        return Object.freeze(cloneDeep(this.#state));
    }
    subscribe = (_subscriber, options) => {
        const eventsMap = this.#machine.eventsMap;
        const promiseesMap = this.#machine.promiseesMap;
        const find = Array.from(this.#subscribers).find(f => f.id === options?.id);
        if (find)
            return find;
        const subcriber = interpreters_subscriber.createSubscriber(eventsMap, promiseesMap, _subscriber, options);
        this.#subscribers.add(subcriber);
        return subcriber;
    };
    #errorsCollector = new Set();
    #warningsCollector = new Set();
    /**
     * @deprecated
     * Just use for testing
     * @remarks returns nothing in prod
     */
    get _errorsCollector() {
        if (utils_environment.IS_TEST) {
            return this.#errorsCollector;
            /* v8 ignore next 3 */
        }
        console.error('errorsCollector is not available in production');
        return;
    }
    /**
     * @deprecated
     * Just use for testing
     * @remarks returns nothing in prod
     */
    get _warningsCollector() {
        if (utils_environment.IS_TEST) {
            return this.#warningsCollector;
            /* v8 ignore next 3 */
        }
        console.error('warningsCollector is not available in production');
        return;
    }
    _addError = (...errors) => {
        errors.forEach(error => this.#errorsCollector.add(error));
    };
    _addWarning = (...warnings) => {
        warnings.forEach(warning => this.#warningsCollector.add(warning));
    };
    // #region Next
    #extractTransitions = (event) => {
        const entriesFlat = Object.entries(this.#flat);
        const flat = [];
        const flat2 = [];
        const type = event.type;
        entriesFlat.forEach(([from, node]) => {
            const on = node.on;
            const trs = on?.[type];
            if (trs) {
                const transitions = basifun.toArray.typed(trs);
                flat.push([from, transitions]);
            }
        });
        flat.forEach(([from, transitions], _, all) => {
            const canTake = all.every(([from2]) => !from2.startsWith(`${from}${constants_strings.DEFAULT_DELIMITER}`));
            if (canTake)
                flat2.push([from, transitions]);
        });
        flat2.sort((a, b) => {
            const from1 = a[0];
            const from2 = b[0];
            const split1 = from1
                .split(constants_strings.DEFAULT_DELIMITER)
                .filter(val => !utils_strings_isStringEmpty.isStringEmpty(val)).length;
            const split2 = from2
                .split(constants_strings.DEFAULT_DELIMITER)
                .filter(val => !utils_strings_isStringEmpty.isStringEmpty(val)).length;
            const splitsAreDifferents = split1 !== split2;
            if (splitsAreDifferents)
                return split2 - split1;
            return from2.localeCompare(from1);
        });
        return flat2;
    };
    _send = event => {
        this.#changeEvent(event);
        this.#setStatus('sending');
        let sv = this.#value;
        const flat2 = this.#extractTransitions(event);
        // #endregion
        flat2.forEach(([from, transitions]) => {
            const cannotContinue = !this.#isInsideValue2(sv, from);
            if (cannotContinue)
                return;
            const target = this.#performTransitions(...basifun.toArray.typed(transitions));
            const diffTarget = target === false ? undefined : target;
            sv = states_functions_nextSV.nextSV(sv, diffTarget);
        });
        const next = basifun.switchV({
            condition: equal(this.#value, sv),
            truthy: undefined,
            falsy: states_functions_initialConfig.initialConfig(this.#machine.valueToConfig(sv)),
        });
        return next;
    };
    get #possibleEvents() {
        return events_functions_possibleEvents.possibleEvents(this.#flat);
    }
    #cannotPerformEvents = (_event) => {
        const type = events_functions_eventToType.eventToType(_event);
        const check = !this.#possibleEvents.includes(type);
        return check;
    };
    /**
     * Creates a sender function for the given event type.
     * @param type - the {@linkcode EventArgT} type of the event to send.
     * @returns a function with the payload as Parameter that sends the event with the given type and payload.
     *
     * @see {@linkcode send} for sending events directly.
     */
    sender = (type) => {
        return (...data) => {
            const payload = data.length === 1 ? data[0] : {};
            const event = { type, payload };
            return this.send(event);
        };
    };
    /**
     * Sends an event without cheching to the current {@linkcode Interpreter} service.
     *
     * @param _event - the {@linkcode EventArg} event to send.
     *
     */
    #send = (_event) => {
        const event = events_functions_transform.transformEventArg(_event);
        const next = this._send(event);
        if (basifun.isDefined(next)) {
            this.#config = next;
            this.#performConfig(true);
            this.#makeWork();
            this._next();
        }
        else
            this.#makeWork();
    };
    /**
     * Sends an event to the current {@linkcode Interpreter} service.
     *
     * @param _event - the {@linkcode EventArg} event to send.
     *
     * @remarks
     * If the event cannot be performed, it will not be sent.
     * If the event is sent, it will be processed and the state will be updated.
     */
    send = (_event) => {
        const check = this.#cannotPerformEvents(_event);
        if (check)
            return;
        this.#send(_event);
    };
    /**
     * Proposes the next state value based on the current state value and the target.
     * @param target - the target state to propose the next state value.
     * @returns the next {@linkcode StateValue} based on the current state value and the target.
     *
     * @remarks
     * This method calculates the next state value based on the current state value and the target.
     * It does not change the current state value, but returns the proposed next state value.
     * It is used internally to calculate the next state value before sending an event.
     */
    #proposedNextSV = (target) => states_functions_nextSV.nextSV(this.#value, target);
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
    proposedNextConfig = (target) => {
        const nextValue = this.#proposedNextSV(target);
        const out = this.#machine.valueToConfig(nextValue);
        return out;
    };
    /**
     * Calculates the difference between the current and next configuration.
     * @param target - the target state to calculate the difference.
     * @returns an {@linkcode DiffNext} object containing the proposed next state value, entry actions, and exit actions.
     *
     * @remarks
     * This method is used to calculate the entry and exit actions when transitioning to a new state.
     * It compares the current configuration with the proposed next configuration and returns the differences.
     */
    #diffNext = (target) => {
        if (!target) {
            return { sv: this.#value, diffEntries: [], diffExits: [] };
        }
        const next = types.castings.commons.unknown(states_functions_initialConfig.initialConfig(types.castings.commons.unknown(this.proposedNextConfig(target))));
        const flatNext = states_functions_flatMap.flatMap(next);
        const entriesCurrent = Object.entries(this.#flat);
        const keysNext = Object.keys(flatNext);
        const keys = entriesCurrent.map(([key]) => key);
        const diffEntries = [];
        const diffExits = [];
        // #region Entry actions
        // These actions are from next config states that are not inside the previous
        keysNext.forEach(key => {
            const check2 = !keys.includes(key);
            if (check2) {
                const out2 = flatNext[key];
                const _entries = machine_machine.getEntries(out2);
                diffEntries.push(..._entries);
            }
        });
        // #endregion
        // #region Exit actions
        // These actions are from previous config states that are not inside the next
        entriesCurrent.forEach(([key, node]) => {
            const check2 = !keysNext.includes(key);
            if (check2) {
                const _exits = machine_machine.getExits(node);
                diffExits.push(..._exits);
            }
        });
        // #endregion
        const sv = this.#proposedNextSV(target);
        return { sv, diffEntries, diffExits };
    };
    /**
     * Checks if the given value is inside the current state value.
     * @param value - the state value to check if it is inside the current state value.
     * @returns true if the value is inside the current state value, false otherwise.
     */
    #isInsideValue = (value) => {
        return this.#isInsideValue2(this.#value, value);
    };
    #isInsideValue2 = (sv, value) => {
        const values = decompose.decomposeSV(sv);
        const entry = value.substring(1);
        const state = utils_strings_replaceAll.replaceAll({
            entry,
            match: constants_strings.DEFAULT_DELIMITER,
            replacement: '.',
        });
        return values.includes(state);
    };
    /**
     * Changes the current {@linkcode Interpreter} service status to 'working'.
     * @returns the current {@linkcode WorkingStatus} of this {@linkcode Interpreter} service.
     */
    #makeWork = () => this.#setStatus('working');
    // #endregion
    /**
     * Returns the output value with a warning if it is not defined.
     * @param out of type [T], the output value to check if it is defined.
     * @param messages - the messages to add to the warnings collector if the output is not defined. it's a parram array
     */
    #returnWithWarning = (out, ...messages) => {
        const check = basifun.isDefined(out);
        if (check)
            return out;
        this._addWarning(...messages);
        return;
    };
    toActionFn = (action) => {
        const events = this.#machine.eventsMap;
        const promisees = this.#machine.promiseesMap;
        const actions = this.#machine.actions;
        return this.#returnWithWarning(actions_functions_toAction.toAction(events, promisees, action, actions), `Action (${actions_functions_reduceAction.reduceAction(action)}) is not defined`);
    };
    toPredicateFn = (guard) => {
        const events = this.#machine.eventsMap;
        const promisees = this.#machine.promiseesMap;
        const predicates = this.#machine.predicates;
        const { predicate, errors } = guards_functions_toPredicate.toPredicate(events, promisees, guard, predicates);
        return this.#returnWithWarning(predicate, ...errors);
    };
    toPromiseSrcFn = (src) => {
        const events = this.#machine.eventsMap;
        const promisees = this.#machine.promiseesMap;
        const promises = this.#machine.promises;
        return this.#returnWithWarning(promises_functions_src.toPromiseSrc(events, promisees, src, promises), `Promise (${src}) is not defined`);
    };
    toDelayFn = (delay) => {
        const events = this.#machine.eventsMap;
        const promisees = this.#machine.promiseesMap;
        const delays = this.#machine.delays;
        return this.#returnWithWarning(delays_functions_toDelay.toDelay(events, promisees, delay, delays), `Delay (${delay}) is not defined`);
    };
    toMachine = (machine) => {
        const machines = this.#machine.machines;
        return this.#returnWithWarning(machine_functions_toMachine.toMachine(machine, machines), `Machine (${actions_functions_reduceAction.reduceAction(machine)}) is not defined`);
    };
    interpretChild = interpret;
    //TODO: Add a subscribeTo Method to subscribe to a already started service
    /**
     * Subscribes a child machine to the current machine.
     *
     * @param id - The unique identifier for the child machine.
     * @param {@linkcode ChildS2} - The child machine configuration to subscribe.
     * @returns a {@linkcode SubscriberClass} result of the child machine subscription.
     *
     */
    subscribeMachine = (id, { initials: _initials, ...rest }) => {
        const reduced = utils_reduceFnMap.reduceFnMap(this.#machine.eventsMap, this.#machine.promiseesMap, _initials);
        const initials = reduced(this.#cloneState);
        const child = types.castings.commons({
            initials,
            ...rest,
        });
        return this.#reduceChild(child, id);
    };
    /**
     * Sends an event to a specific child service by its ID.
     *
     * @param to - The ID of the child service to which the event will be sent.
     * @param : the {@linkcode EventObject} event to send to the child service.
     *
     * @see {@linkcode send} for sending events to the current service.
     * @see {@linkcode castings} for type casting.
     */
    #sendTo = (to, event) => {
        const service = this.#childrenServices.find(({ id }) => id === to);
        if (service)
            service.send(types.castings.commons(event));
    };
    /**
     * Performs some computations to reduce a child machine configuration to a service and subscribes to it.
     *
     * @param : {@linkcode ChildS} - The child machine configuration to reduce.
     * @param id - The unique identifier for the child service.
     * @returns a {@linkcode SubscriberClass} result of the child service subscription.
     */
    #reduceChild = ({ subscribers, machine, initials }, id) => {
        let service = types.castings.commons(this.#childrenServices.find(f => f.id === id));
        if (!service) {
            service = this.interpretChild(machine, initials);
            service.id = id;
            this.#childrenServices.push(types.castings.commons(service));
        }
        const subscriber = service.subscribe(({ event }) => {
            const type = events_functions_eventToType.eventToType(event);
            const _subscribers = basifun.toArray.typed(subscribers);
            _subscribers.forEach(({ contexts, events }) => {
                const type2 = events_functions_eventToType.eventToType(service.#event);
                const checkEvents = machine_functions_subcriber_events.reduceEvents(types.castings.commons.any(events), type, type2);
                const checkContexts = !basifun.isDefined(contexts);
                if (checkEvents) {
                    if (checkContexts) {
                        const pContext = types.castings.commons.any(service.#context);
                        const callback = () => this.#mergeContexts({ pContext });
                        this.#schedule(callback);
                    }
                    else {
                        const _contexts = types.castings.commons.unknown(contexts);
                        const paths = basifun.toArray.typed(_contexts);
                        paths.forEach(path => {
                            if (typeof path === 'string') {
                                const callback = () => machine_functions_subcriber_contexts.assignByKey(this.#pContext, path, service.#context);
                                this.#schedule(callback);
                            }
                            else {
                                const entries = Object.entries(path).map(([key, value]) => {
                                    const paths = basifun.toArray.typed(value);
                                    return types.castings.arrays.tupleOf(key, paths);
                                });
                                entries.forEach(([pathChild, paths]) => {
                                    paths.forEach(path => {
                                        const pContext = machine_functions_subcriber_contexts.mergeByKey(this.#pContext)(path, machine_functions_subcriber_contexts.getByKey(service.#context, pathChild));
                                        const callback = () => this.#mergeContexts({ pContext });
                                        this.#schedule(callback);
                                    });
                                });
                            }
                        });
                    }
                }
            });
        }, { id });
        return subscriber;
    };
    // #region Disposable
    dispose = () => {
        this.stop();
        this.#childrenServices.forEach(this.#dispose);
        this.#timeoutActions.forEach(this.#dispose);
    };
    [Symbol.dispose] = this.dispose;
    [Symbol.asyncDispose] = () => {
        const out = basifun.asyncfy(this[Symbol.dispose]);
        return out();
    };
}
const TIME_TO_RINIT_SELF_COUNTER = constants_numbers.DEFAULT_MIN_ACTIVITY_TIME * 2;
const _interpret = (machine, args) => {
    const { context, pContext, mode, exact } = args ?? {};
    const out = new Interpreter(machine, mode, exact);
    out._ppC(pContext ?? {});
    out._provideContext(context ?? {});
    return out;
};
/**
 * Creates an {@linkcode Interpreter} service from the given {@linkcode MachineConfig} machine.
 *
 * @param machine - The {@linkcode MachineConfig} machine to create the interpreter from.
 * @param options - The options for the interpreter, including context, private context, mode, and exact.
 * @returns an {@linkcode Interpreter} service.
 *
 * @see {@linkcode MachineConfig}
 */
const interpret = _interpret;

exports.Interpreter = Interpreter;
exports.TIME_TO_RINIT_SELF_COUNTER = TIME_TO_RINIT_SELF_COUNTER;
exports._interpret = _interpret;
exports.interpret = interpret;
//# sourceMappingURL=interpreter.cjs.map
