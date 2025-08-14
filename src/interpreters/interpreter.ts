import {
  reduceAction,
  toAction,
  type ActionConfig,
  type ActionResult,
} from '#actions';
import {
  DEFAULT_DELIMITER,
  DEFAULT_MAX_SELF_TRANSITIONS,
  DEFAULT_MAX_TIME_PROMISE,
  DEFAULT_MIN_ACTIVITY_TIME,
} from '#constants';
import { toDelay } from '#delays';
import {
  eventToType,
  INIT_EVENT,
  possibleEvents,
  transformEventArg,
  type EventArg,
  type EventArgT,
  type EventObject,
  type EventsMap,
  type InitEvent,
  type PromiseeMap,
  type ToEvents,
  type ToEventsR,
} from '#events';
import { toPredicate, type GuardConfig } from '#guards';
import { getEntries, getExits, type Machine } from '#machine';
import {
  assignByKey,
  ChildS,
  getByKey,
  mergeByKey,
  reduceEvents,
  toMachine,
  type AnyMachine,
  type ChildS2,
  type Config,
  type ConfigFrom,
  type ContextFrom,
  type EventsMapFrom,
  type ExtendedActionsParams,
  type GetEventsFromConfig,
  type MachineConfig,
  type MachineOptions,
  type MachineOptionsFrom,
  type PrivateContextFrom,
  type PromiseesMapFrom,
  type ScheduledData,
  type SimpleMachineOptions2,
} from '#machines';
import {
  PromiseeConfig,
  toPromiseSrc,
  type PromiseeResult,
} from '#promises';
import {
  flatMap,
  initialConfig,
  nextSV,
  Node,
  nodeToValue,
  resolveNode,
  type ActivityConfig,
  type NodeConfig,
  type StateValue,
} from '#states';
import type {
  AlwaysConfig,
  DelayedTransitions,
  TransitionConfig,
} from '#transitions';
import { isDescriber, type RecordS } from '#types';
import {
  IS_TEST,
  isStringEmpty,
  merge,
  reduceFnMap,
  replaceAll,
} from '#utils';
import {
  anyPromises,
  asyncfy,
  isDefined,
  partialCall,
  switchV,
  toArray,
  withTimeout,
  type TimeoutPromise,
} from '@bemedev/basifun';
import { decomposeSV } from '@bemedev/decompose';
import {
  createInterval,
  createTimeout,
  type Interval2,
  type Timeout2,
} from '@bemedev/interval2';
import sleep from '@bemedev/sleep';
import { castings, type types } from '@bemedev/types';
import cloneDeep from 'clone-deep';
import equal from 'fast-deep-equal';
import type {
  _Send_F,
  AddSubscriber_F,
  AnyInterpreter,
  Collected0,
  CreateInterval2_F,
  DiffNext,
  ExecuteActivities_F,
  Interpreter_F,
  Mode,
  PerformAction_F,
  PerformActionLater_F,
  PerformAfter_F,
  PerformAlway_F,
  PerformDelay_F,
  PerformPredicate_F,
  PerformPromise_F,
  PerformPromisee_F,
  PerformTransition_F,
  PerformTransitions_F,
  Selector_F,
  State,
  StateExtended,
  WorkingStatus,
} from './interpreter.types';
import { Scheduler } from './scheduler';

import { createSubscriber, type SubscriberClass } from './subscriber';

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
export class Interpreter<
  const C extends Config = Config,
  Pc = any,
  const Tc extends types.PrimitiveObject = types.PrimitiveObject,
  E extends EventsMap = GetEventsFromConfig<C>,
  P extends PromiseeMap = PromiseeMap,
  Mo extends SimpleMachineOptions2 = MachineOptions<C, E, P, Pc, Tc>,
> implements AnyInterpreter<E, P, Pc, Tc>
{
  /**
   * The {@linkcode Machine} machine being interpreted.
   */
  #machine: Machine<C, Pc, Tc, E, P, Mo>;

  /**
   * The current {@linkcode WorkingStatus} status of the this {@linkcode Interpreter} service.
   */
  #status: WorkingStatus = 'idle';

  /**
   * The current {@linkcode NodeConfigWithInitials} config state of this {@linkcode Interpreter} service.
   */
  #config: NodeConfig;

  /**
   * The {@linkcode RecordS}<{@linkcode NodeConfigWithInitials}> flat representation of all possible config states of this {@linkcode Interpreter} service.
   */
  #flat!: RecordS<NodeConfig>;

  /**
   * The current {@linkcode StateValue}> of this {@linkcode Interpreter} service.
   */
  #value!: StateValue;

  /**
   * The {@linkcode Mode} of this {@linkcode Interpreter} service
   */
  #mode: Mode;

  /**
   * The initial {@linkcode Node} of the inner {@linkcode Machine}.
   */
  readonly #initialNode: Node<E, P, Pc, Tc>;

  /**
   * The current {@linkcode Node} of this {@linkcode Interpreter} service.
   */
  #node!: Node<E, P, Pc, Tc>;

  /**
   * an iiner ietrator to count the number of operations performed by this {@linkcode Interpreter} service.
   */
  #iterator = 0;

  /**
   * The current {@linkcode ToEvents} event of this {@linkcode Interpreter} service.
   */
  #event: ToEvents<E, P> | InitEvent = INIT_EVENT;

  /**
   * The initial {@linkcode NodeConfigWithInitials} of the inner {@linkcode Machine}.
   */
  readonly #initialConfig: NodeConfig;

  /**
   * The initial {@linkcode Pc} private context of this {@linkcode Interpreter} service.
   */
  #initialPpc!: Pc;

  /**
   * The initial {@linkcode Tc} context of this {@linkcode Interpreter} service.
   */
  #initialContext!: Tc;

  /**
   * The current {@linkcode Pc} private context of this {@linkcode Interpreter} service.
   */
  #pContext!: Pc;

  /**
   * The current {@linkcode Tc} context of this {@linkcode Interpreter} service.
   */
  #context!: Tc;

  /**
   * The {@linkcode Scheduler} of this {@linkcode Interpreter} service.
   */
  #scheduler: Scheduler;

  /**
   * The previous {@linkcode State} of this {@linkcode Interpreter} service.
   */
  #previousState!: State<Tc>;

  /**
   * The current {@linkcode State} of this {@linkcode Interpreter} service.
   */
  #state!: State<Tc, ToEvents<E, P>>;

  /**
   * All {@linkcode AnyInterpreter2} service subscribers of this {@linkcode Interpreter} service.
   */
  #childrenServices: (AnyInterpreter2 & { id: string })[] = [];

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
  getChildAt = (id: string) => this.children.find(f => f.id === id);

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
    const _machines = toArray.typed(this.#machine.config.machines);
    return _machines.map(this.toMachine).filter(isDefined);
  }

  /**
   * The id of the current {@linkcode Interpreter} service.
   * Used for child machines identification.
   */
  id?: string;

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
  constructor(
    machine: Machine<C, Pc, Tc, E, P, Mo>,
    mode: Mode = 'strict',
    exact = true,
  ) {
    this.#machine = machine.renew;

    this.#config = this.#initialConfig = this.#machine.initialConfig;
    this.#initialNode = this.#resolveNode(this.#initialConfig);
    this.#mode = mode;
    this.#exact = exact;
    this.#performConfig(true);
    this.#scheduler = new Scheduler();
    this.#state = this.#previousState = {
      status: this.#status,
      context: this.#context,
      event: INIT_EVENT,
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
  #performStates = (parts?: Partial<State<Tc, ToEvents<E, P>>>) => {
    this.#previousState = cloneDeep(this.#state);
    this.#state = { ...this.#state, ...parts };
    this.#flush();
  };

  /**
   * Performs computations, after transitioning to the next target, to update the current {@linkcode NodeConfigWithInitials} config state of this {@linkcode Interpreter} service
   */
  protected _performConfig = () => {
    const value = nodeToValue(this.#config);
    this.#value = value;
    this.#performStates({ value });

    this.#node = this.#resolveNode(this.#config);

    const configForFlat = castings.commons.unknown<NodeConfig>(
      this.#config,
    );

    this.#flat = castings.commons.any(flatMap(configForFlat));
  };

  /**
   * Performs computations, to update the current {@linkcode NodeConfigWithInitials} config state of this {@linkcode Interpreter} service
   * @param target, the target to perform the config for.
   */
  #performConfig = (target?: string | true) => {
    if (target === true) return this._performConfig();

    if (target) {
      this.#config = this.proposedNextConfig(target);
      const tags = this.#config.tags;
      this.#performStates({ tags });
      return this._performConfig();
    }
  };

  protected _iterate = () => this.#iterator++;

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
  #resolveNode = (config: NodeConfig) => {
    const options = this.#machine.options;
    const events = this.#machine.eventsMap;
    const promisees = this.#machine.promiseesMap;

    return resolveNode<E, P, Pc, Tc>(events, promisees, config, options);
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
    if (IS_TEST) {
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

  get select(): Selector_F<Tc> {
    const check = castings.commons.primitive.is(this.#context);
    if (check) return undefined as any;
    const out: any = (path: string) => getByKey(this.#context, path);
    return out as any;
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
  get _pSelect(): Selector_F<Pc> {
    if (IS_TEST) {
      const pContext = this.#pContext;
      const check = castings.commons.primitive.is(pContext);
      if (check) return undefined as any;
      if (pContext) {
        const out: any = (path: string) => getByKey(pContext, path);
        return out as any;
      }
      /* v8 ignore next 4 */
    }
    console.error('pContext is not available in production');
    return undefined as any;
  }

  /**
   * Set the current {@linkcode WorkingStatus} private context of this {@linkcode Interpreter} service.
   * @returns 'started'.
   */
  #startStatus = (): WorkingStatus => this.#setStatus('started');

  /**
   * Helper to format inner errors and warnings.
   * @param messages - an iterable of messages to format.
   * @returns an array of messages joined by new line.
   *
   * @remarks Used to display console messages in a readable format.
   */
  #displayConsole = (messages: Iterable<string>) => {
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
  #timeoutActions: Timeout2[] = [];

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
  protected _next = async () => {
    let check = false;
    do {
      const startTime = Date.now();
      const previousValue = this.#value;

      const checkCounter =
        this.#selfTransitionsCounter >= DEFAULT_MAX_SELF_TRANSITIONS;
      if (checkCounter) return this.#throwMaxCounter();
      this.#throwing();

      await this.#next();

      const currentValue = this.#value;
      check = !equal(previousValue, currentValue);

      if (check) {
        this.#flush();
      }

      const duration = Date.now() - startTime;
      const check2 = duration > TIME_TO_RINIT_SELF_COUNTER;
      if (check2) this.#selfTransitionsCounter = 0;
    } while (check);

    this.#selfTransitionsCounter = 0;
  };

  get #cloneState(): StateExtended<Pc, Tc, ToEvents<E, P>> {
    const pContext = structuredClone(this.#pContext);

    return structuredClone({ pContext, ...this.#state });
  }

  #performAction: PerformActionLater_F<E, P, Pc, Tc> = action => {
    this._iterate();
    return action(this.#cloneState);
  };

  #performScheduledAction = (scheduled?: ScheduledData<Pc, Tc>) => {
    if (!scheduled) return;
    const { data, ms: timeout, id } = scheduled;

    const callback = () => {
      const cb = () => this.#mergeContexts(data);
      this.#schedule(cb);
    };

    this.#timeoutActions.filter(f => f.id === id).forEach(this.#dispose);

    this.#timeoutActions = this.#timeoutActions.filter(f => f.id !== id);

    const timer = createTimeout({ callback, timeout, id });
    this.#timeoutActions.push(timer);
    timer.start();
  };

  #performSendToAction = (sentEvent?: { to: string; event: any }) => {
    if (!sentEvent) return;
    this.#sendTo(sentEvent.to, sentEvent.event);
  };

  #performResendAction = (resend?: EventArg<E>) => {
    if (!resend) return;
    const cannot = this.#cannotPerformEvents(resend);
    if (cannot) return;

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
  #performForceSendAction = (forceSend?: EventArg<E>) => {
    if (!forceSend) return;

    const values = Object.values(this.#machine.flat);
    values.forEach(({ on }) => {
      const type = eventToType(forceSend);
      const transitions = toArray.typed(on?.[type]);
      this.#performTransitions(...(transitions as any));
    });
  };

  #performPauseActivityAction = (id?: string) => {
    if (!id) return;
    this.#currentActivities?.filter(f => f.id === id).forEach(this.#pause);
  };

  #performResumeActivityAction = (id?: string) => {
    if (!id) return;
    this.#currentActivities
      ?.filter(f => f.id === id)
      .forEach(this.#resume);
  };

  #performStopActivityAction = (id?: string) => {
    if (!id) return;
    this.#currentActivities
      ?.filter(f => f.id === id)
      .forEach(this.#dispose);
  };

  #performPauseTimerAction = (id?: string) => {
    if (!id) return;
    this.#timeoutActions.filter(f => f.id === id).forEach(this.#pause);
  };

  #performResumeTimerAction = (id?: string) => {
    if (!id) return;
    this.#timeoutActions.filter(f => f.id === id).forEach(this.#resume);
  };

  #performStopTimerAction = (id?: string) => {
    if (!id) return;
    this.#timeoutActions.filter(f => f.id === id).forEach(this.#stop);
  };

  #performsExtendedActions = ({
    forceSend,
    resend,
    scheduled,
    pauseActivity,
    resumeActivity,
    stopActivity,
    pauseTimer,
    resumeTimer,
    stopTimer,
    sentEvent,
  }: ExtendedActionsParams<E, Pc, Tc>) => {
    this.#performSendToAction(sentEvent);

    this.#performScheduledAction(scheduled);
    this.#performPauseActivityAction(pauseActivity);
    this.#performResumeActivityAction(resumeActivity);
    this.#performStopActivityAction(stopActivity);
    this.#performPauseTimerAction(pauseTimer);
    this.#performResumeTimerAction(resumeTimer);
    this.#performStopTimerAction(stopTimer);

    // ForceSendAction returns the result to make further actions
    const result =
      this.#performForceSendAction(forceSend) ??
      this.#performResendAction(resend);

    return result;
  };

  #executeAction: PerformAction_F<E, P, Pc, Tc> = action => {
    this.#makeBusy();

    const { pContext, context, ...extendeds } =
      this.#performAction(action);

    this.#mergeContexts({ pContext, context });

    this.#performsExtendedActions(extendeds);
  };

  /**
   * Throws if the number of self transitions exceeds {@linkcode DEFAULT_MAX_SELF_TRANSITIONS}.
   */
  #throwMaxCounter() {
    const error = `Too much self transitions, exceeded ${DEFAULT_MAX_SELF_TRANSITIONS} transitions`;
    if (IS_TEST) {
      this._addError(error);
      this.#throwing();
      this.stop();
      /* v8 ignore next 1 */
    } else throw error;
  }

  // get #contexts() {
  //   return castings.commons<ActionResult<Pc, Tc>>({
  //     pContext: cloneDeep(this.#pContext),
  //     context: structuredClone(this.#context),
  //   });
  // }

  #performActions = (...actions: ActionConfig[]) => {
    actions
      .map(this.toActionFn)
      .filter(f => f !== undefined)
      .forEach(this.#executeAction);
  };

  #performPredicate: PerformPredicate_F<E, P, Pc, Tc> = predicate => {
    this._iterate();
    return predicate(this.#cloneState);
  };

  #executePredicate: PerformPredicate_F<E, P, Pc, Tc> = predicate => {
    this.#makeBusy();
    const out = this.#performPredicate(predicate);

    this.#makeWork();

    return out;
  };

  #performPredicates = (...guards: GuardConfig[]) => {
    if (guards.length < 1) return true;
    return guards
      .map(this.toPredicateFn)
      .filter(isDefined)
      .map(this.#executePredicate)
      .every(b => b);
  };

  #performDelay: PerformDelay_F<E, P, Pc, Tc> = delay => {
    this._iterate();
    return delay(this.#cloneState);
  };

  #executeDelay: PerformDelay_F<E, P, Pc, Tc> = delay => {
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

  #mergeContexts = (result?: ActionResult<Pc, Tc>) => {
    this.#pContext = merge(this.#pContext, result?.pContext);
    const context = merge(this.#context, result?.context);
    this.#context = context;
    this.#performStates({ context });

    this.#flush();
  };

  #executeActivities: ExecuteActivities_F = (from, _activities) => {
    const entries = Object.entries(_activities);
    const outs: string[] = [];

    for (const [_delay, _activity] of entries) {
      const id = `${from}::${_delay}`;
      const _interval = this._cachedIntervals.find(f => f.id === id);

      if (_interval) {
        outs.push(id);
        continue;
      }

      const delayF = this.toDelayFn(_delay);
      const check0 = !isDefined(delayF);
      if (check0) return [];
      const interval = this.#executeDelay(delayF);

      const check11 = interval < DEFAULT_MIN_ACTIVITY_TIME;
      if (check11) {
        this._addWarning(`Delay (${_delay}) is too short`);
        return [];
      }

      const check12 = interval > DEFAULT_MAX_TIME_PROMISE;
      if (check12) {
        this._addWarning(`Delay (${_delay}) is too long`);
        return [];
      }

      const activities = toArray.typed(_activity);

      const callback = () => {
        const cb = () => {
          for (const activity of activities) {
            const check2 = typeof activity === 'string';
            const check3 = isDescriber(activity);
            const check4 = check2 || check3;

            if (check4) {
              this.#performActions(activity);
              continue;
            }

            const check5 = this.#performPredicates(
              ...toArray.typed(activity.guards),
            );
            if (check5) {
              const actions = toArray.typed(activity.actions);
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

  #exact: boolean;

  protected createInterval: CreateInterval2_F = ({
    callback,
    id,
    interval,
  }) => {
    const exact = this.#exact;
    const out = createInterval({
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
  protected _cachedIntervals: Interval2[] = [];

  #performTransition: PerformTransition_F = transition => {
    const check = typeof transition == 'string';
    if (check) {
      const { diffEntries, diffExits } = this.#diffNext(transition);
      this.#performActions(...toArray.typed(diffExits));
      this.#performActions(...toArray.typed(diffEntries));
      return transition;
    }
    const { guards, actions, target } = transition;
    const { diffEntries, diffExits } = this.#diffNext(target);

    const response = this.#performPredicates(
      ...toArray<GuardConfig>(guards),
    );

    if (response) {
      this.#performActions(...toArray<ActionConfig>(diffExits));
      this.#performActions(...toArray<ActionConfig>(actions));
      this.#performActions(...toArray<ActionConfig>(diffEntries));
      return target ?? false;
    }
    return false;
  };

  #performTransitions: PerformTransitions_F = (...transitions) => {
    // let transition: ReturnType<PerformTransition_F<Pc, Tc>> = false;
    for (const _transition of transitions) {
      const transition = this.#performTransition(_transition);
      const check1 = typeof transition === 'string';
      if (check1) return transition;
    }
    return false;
  };

  #performPromiseSrc: PerformPromise_F<E, P, Pc, Tc> = promise => {
    this._iterate();
    return promise(this.#cloneState);
  };

  #performFinally = (_finally?: PromiseeConfig['finally']) => {
    const check1 = _finally === undefined;
    if (check1) return;

    const finals = toArray.typed(_finally);

    for (const final of finals) {
      const check2 = typeof final === 'string';
      const check3 = isDescriber(final);

      const check4 = check2 || check3;
      if (check4) {
        this.#performActions(final);
        continue;
      }

      const response = this.#performPredicates(
        ...toArray.typed(final.guards),
      );
      if (response) {
        this.#performActions(...toArray.typed(final.actions));
      }
    }
    return;
  };

  get #sending() {
    return this.#status === 'sending';
  }

  #performPromisee: PerformPromisee_F<E, P> = (from, ...promisees) => {
    type PR = PromiseeResult<E, P>;

    const promises: TimeoutPromise<PR | undefined>[] = [];

    promisees.forEach(
      ({ src, then, catch: _catch, finally: _finally, max: maxS }) => {
        const promiseF = this.toPromiseSrcFn(src);
        if (!promiseF) return;

        const handlePromise = (type: 'then' | 'catch', payload: any) => {
          const out = () => {
            const event = {
              type: `${src}::${type}`,
              payload,
            };
            this.#changeEvent(castings.commons.any(event));

            const transitions = toArray.typed(
              type === 'then' ? then : _catch,
            );

            const target = this.#performTransitions(
              ...(transitions as any),
            );

            this.#performFinally(_finally);

            return { event: this.#event, target };
          };

          if (this.#cannotPerform(from)) return;
          return out();
        };

        const _promise = () =>
          this.#performPromiseSrc(promiseF)
            .then(partialCall(handlePromise, 'then'))
            .catch(partialCall(handlePromise, 'catch'));

        const MAX_POMS = [DEFAULT_MAX_TIME_PROMISE];

        const check3 = isDefined(maxS);
        if (check3) {
          const delayF = this.toDelayFn(maxS);
          const check4 = !isDefined(delayF);
          if (check4) return this.#throwing();
          const max = this.#performDelay(delayF);
          MAX_POMS.push(max);
        }

        const promise = withTimeout.safe(_promise, from, ...MAX_POMS);
        promises.push(promise);
      },
    );

    const check5 = promises.length < 1;

    if (check5) return;

    const promise = anyPromises(from, ...promises);
    return promise;
  };

  /**
   * Checks if sent events cannot be performed.
   * @param from - the config value from which the events are sent.
   * @returns true if the events cannot be performed, false otherwise.
   */
  #cannotPerform = (from: string) => {
    const check = this.#sending || !this.#isInsideValue(from);
    return check;
  };

  #performAfter: PerformAfter_F = (from, after) => {
    const entries = Object.entries(after);
    const promises: TimeoutPromise<string | false>[] = [];

    entries.forEach(([_delay, transition]) => {
      const delayF = this.toDelayFn(_delay);
      const check0 = !isDefined(delayF);

      if (check0) return;

      const delay = this.#executeDelay(delayF);

      const check1 = delay > DEFAULT_MAX_TIME_PROMISE;
      if (check1) {
        this._addWarning(`Delay ${_delay} is too long`);
        return;
      }

      const transitions = toArray.typed(transition);

      const _promise = async () => {
        await sleep(delay);

        const func = () =>
          this.#performTransitions(...(transitions as any));

        if (this.#cannotPerform(from)) return false;

        const out = func();

        if (out === false) {
          const message = `No transitions reached from "${from}" by delay "${_delay}" !`;

          throw message;
        }
        return out;
      };

      const promise = withTimeout(
        _promise,
        from,
        DEFAULT_MAX_TIME_PROMISE,
      );

      promises.push(promise);
    });

    const check5 = promises.length < 1;
    if (check5) return;

    const promise = anyPromises(from, ...promises);
    return promise;
  };

  #performAlways: PerformAlway_F = alway => {
    const always = toArray<TransitionConfig>(alway);
    return this.#performTransitions(...always);
  };

  get #collectedPromisees() {
    const entriesFlat = Object.entries(this.#flat);
    const entries: [from: string, ...promisees: PromiseeConfig[]][] = [];

    entriesFlat.forEach(([from, node]) => {
      const promisees = toArray.typed(node.promises);
      if (node.promises) {
        entries.push([from, ...promisees]);
      }
    });

    return entries;
  }

  get #collectedActivities() {
    const entriesFlat = Object.entries(this.#flat);

    const entries: [from: string, activities: ActivityConfig][] = [];

    entriesFlat.forEach(([from, { activities }]) => {
      if (activities) {
        entries.push([from, activities]);
      }
    });

    return entries;
  }

  get #collectedAfters() {
    const entriesFlat = Object.entries(this.#flat);
    const entries: [from: string, after: DelayedTransitions][] = [];

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
    const entries: [from: string, always: AlwaysConfig][] = [];

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
    if (check) return;

    const ids: string[] = [];
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
      this.#reduceChild(castings.commons.any(child), id);
    });

    this.#childrenServices.forEach(child => {
      child.start();
    });
  };

  /**
   * Get all brut self transitions of the current {@linkcode NodeConfigWithInitials} config state of this {@linkcode Interpreter} service.
   */
  get #collectedSelfTransitions0() {
    const entries = new Map<string, Collected0<E, P>>();

    this.#collectedAlways.forEach(([from, always]) => {
      entries.set(from, { always: () => this.#performAlways(always) });
    });

    this.#collectedAfters.forEach(([from, after]) => {
      const inner = entries.get(from);
      if (inner) {
        inner.after = this.#performAfter(from, after);
      } else entries.set(from, { after: this.#performAfter(from, after) });
    });

    this.#collectedPromisees.forEach(([from, ...promisees]) => {
      const inner = entries.get(from);
      if (inner) {
        inner.promisee = this.#performPromisee(from, ...promisees);
      } else {
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
  #changeEvent = (event: ToEventsR<E, P>) => {
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

        const promises: TimeoutPromise<void>[] = [];
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
          promises.push(withTimeout(_after, 'after'));
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
          promises.push(withTimeout(_promisee, 'promisee'));
        }

        const check1 = promises.length < 1;
        if (check1) return;

        await anyPromises(from, ...promises)();
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
    const actions = getEntries(this.#initialConfig);
    if (actions.length < 1) return;
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
  #mapperFn = <T>(key: types.AllowedNames<T, types.Fn>) => {
    return (value: T) => {
      const fn = (value as any)[key];
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

  #makeBusy = (): WorkingStatus => {
    return this.#setStatus('busy');
  };

  #setStatus = (status: WorkingStatus) => {
    this.#performStates({ status });
    return (this.#status = status);
  };

  #startingStatus = (): WorkingStatus => {
    return this.#setStatus('starting');
  };

  /**
   * @deprecated
   * Used internally
   */
  _providePrivateContext = (pContext: Pc) => {
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
  _provideContext = (context: Tc) => {
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

  #subscribers = new Set<SubscriberClass<E, P, Tc>>();

  get state() {
    return Object.freeze(cloneDeep(this.#state));
  }

  subscribe: AddSubscriber_F<E, P, Tc> = (_subscriber, options) => {
    const eventsMap = this.#machine.eventsMap;
    const promiseesMap = this.#machine.promiseesMap;
    const find = Array.from(this.#subscribers).find(
      f => f.id === options?.id,
    );
    if (find) return find;

    const subcriber = createSubscriber(
      eventsMap,
      promiseesMap,
      _subscriber,
      options,
    );
    this.#subscribers.add(subcriber);
    return subcriber;
  };

  #errorsCollector = new Set<string>();
  #warningsCollector = new Set<string>();

  /**
   * @deprecated
   * Just use for testing
   * @remarks returns nothing in prod
   */
  get _errorsCollector() {
    if (IS_TEST) {
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
    if (IS_TEST) {
      return this.#warningsCollector;
      /* v8 ignore next 3 */
    }
    console.error('warningsCollector is not available in production');
    return;
  }

  protected _addError = (...errors: string[]) => {
    errors.forEach(error => this.#errorsCollector.add(error));
  };

  protected _addWarning = (...warnings: string[]) => {
    warnings.forEach(warning => this.#warningsCollector.add(warning));
  };

  // #region Next

  #extractTransitions = (event: ToEventsR<E, P>) => {
    type FlatArray = [from: string, transitions: TransitionConfig[]][];
    const entriesFlat = Object.entries(this.#flat);
    const flat: FlatArray = [];
    const flat2: FlatArray = [];

    const type = event.type;
    entriesFlat.forEach(([from, node]) => {
      const on = node.on;
      const trs = on?.[type];
      if (trs) {
        const transitions = toArray.typed(trs);
        flat.push([from, transitions as any]);
      }
    });

    flat.forEach(([from, transitions], _, all) => {
      const canTake = all.every(
        ([from2]) => !from2.startsWith(`${from}${DEFAULT_DELIMITER}`),
      );
      if (canTake) flat2.push([from, transitions]);
    });

    flat2.sort((a, b) => {
      const from1 = a[0];
      const from2 = b[0];

      const split1 = from1
        .split(DEFAULT_DELIMITER)
        .filter(val => !isStringEmpty(val)).length;

      const split2 = from2
        .split(DEFAULT_DELIMITER)
        .filter(val => !isStringEmpty(val)).length;

      const splitsAreDifferents = split1 !== split2;
      if (splitsAreDifferents) return split2 - split1;
      return from2.localeCompare(from1);
    });

    return flat2;
  };

  protected _send: _Send_F<E, P> = event => {
    this.#changeEvent(event);
    this.#setStatus('sending');
    let sv = this.#value;

    const flat2 = this.#extractTransitions(event);
    // #endregion

    flat2.forEach(([from, transitions]) => {
      const cannotContinue = !this.#isInsideValue2(sv, from);
      if (cannotContinue) return;

      const target = this.#performTransitions(
        ...toArray.typed(transitions),
      );

      const diffTarget = target === false ? undefined : target;
      sv = nextSV(sv, diffTarget);
    });

    const next = switchV({
      condition: equal(this.#value, sv),
      truthy: undefined,
      falsy: initialConfig(this.#machine.valueToConfig(sv)),
    });

    return next;
  };

  get #possibleEvents() {
    return possibleEvents(this.#flat);
  }

  #cannotPerformEvents = (_event: EventArg<E>) => {
    const type = eventToType(_event);
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
  sender = <T extends EventArgT<E>>(type: T) => {
    type Arg = Extract<ToEventsR<E, P>, { type: T }>['payload'];
    type Payload = object extends Arg ? [] : [Arg];

    return (...data: Payload) => {
      const payload = data.length === 1 ? data[0] : {};
      const event = { type, payload } as EventArg<E>;
      return this.send(event);
    };
  };

  /**
   * Sends an event without cheching to the current {@linkcode Interpreter} service.
   *
   * @param _event - the {@linkcode EventArg} event to send.
   *
   */
  #send = (_event: EventArg<E>) => {
    const event = transformEventArg(_event);
    const next = this._send(event);

    if (isDefined(next)) {
      this.#config = next;
      this.#performConfig(true);
      this.#makeWork();
      this._next();
    } else this.#makeWork();
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
  send = (_event: EventArg<E>) => {
    const check = this.#cannotPerformEvents(_event);
    if (check) return;

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
  #proposedNextSV = (target: string) => nextSV(this.#value, target);

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
  protected proposedNextConfig = (target: string) => {
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
  #diffNext = (target?: string): DiffNext => {
    if (!target) {
      return { sv: this.#value, diffEntries: [], diffExits: [] };
    }

    const next = castings.commons.unknown<NodeConfig>(
      initialConfig(
        castings.commons.unknown(this.proposedNextConfig(target)),
      ),
    );
    const flatNext = flatMap(next);

    const entriesCurrent = Object.entries(this.#flat);
    const keysNext = Object.keys(flatNext);

    const keys = entriesCurrent.map(([key]) => key);
    const diffEntries: ActionConfig[] = [];
    const diffExits: ActionConfig[] = [];

    // #region Entry actions

    // These actions are from next config states that are not inside the previous
    keysNext.forEach(key => {
      const check2 = !keys.includes(key);

      if (check2) {
        const out2 = (flatNext as any)[key];
        const _entries = getEntries(out2);
        diffEntries.push(..._entries);
      }
    });
    // #endregion

    // #region Exit actions

    // These actions are from previous config states that are not inside the next
    entriesCurrent.forEach(([key, node]) => {
      const check2 = !keysNext.includes(key);

      if (check2) {
        const _exits = getExits(node);
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
  #isInsideValue = (value: string) => {
    return this.#isInsideValue2(this.#value, value);
  };

  #isInsideValue2 = (sv: StateValue, value: string) => {
    const values = decomposeSV(sv);
    const entry = value.substring(1);
    const state = replaceAll({
      entry,
      match: DEFAULT_DELIMITER,
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
  #returnWithWarning = <T = any>(
    out: T | undefined,
    ...messages: string[]
  ) => {
    const check = isDefined(out);
    if (check) return out;

    this._addWarning(...messages);
    return;
  };

  toActionFn = (action: ActionConfig) => {
    const events = this.#machine.eventsMap;
    const promisees = this.#machine.promiseesMap;
    const actions = this.#machine.actions;

    return this.#returnWithWarning(
      toAction<E, P, Pc, Tc>(events, promisees, action, actions),
      `Action (${reduceAction(action)}) is not defined`,
    );
  };

  toPredicateFn = (guard: GuardConfig) => {
    const events = this.#machine.eventsMap;
    const promisees = this.#machine.promiseesMap;
    const predicates = this.#machine.predicates;

    const { predicate, errors } = toPredicate<E, P, Pc, Tc>(
      events,
      promisees,
      guard,
      predicates,
    );

    return this.#returnWithWarning(predicate, ...errors);
  };

  toPromiseSrcFn = (src: string) => {
    const events = this.#machine.eventsMap;
    const promisees = this.#machine.promiseesMap;
    const promises = this.#machine.promises;

    return this.#returnWithWarning(
      toPromiseSrc<E, P, Pc, Tc>(events, promisees, src, promises),
      `Promise (${src}) is not defined`,
    );
  };

  toDelayFn = (delay: string) => {
    const events = this.#machine.eventsMap;
    const promisees = this.#machine.promiseesMap;
    const delays = this.#machine.delays;

    return this.#returnWithWarning(
      toDelay<E, P, Pc, Tc>(events, promisees, delay, delays),
      `Delay (${delay}) is not defined`,
    );
  };

  toMachine = (machine: MachineConfig) => {
    const machines = this.#machine.machines;

    return this.#returnWithWarning(
      toMachine<E, P, Tc>(machine, machines),
      `Machine (${reduceAction(machine)}) is not defined`,
    );
  };

  protected interpretChild = interpret;

  //TODO: Add a subscribeTo Method to subscribe to a already started service
  /**
   * Subscribes a child machine to the current machine.
   *
   * @param id - The unique identifier for the child machine.
   * @param {@linkcode ChildS2} - The child machine configuration to subscribe.
   * @returns a {@linkcode SubscriberClass} result of the child machine subscription.
   *
   */
  subscribeMachine = <T extends AnyMachine = AnyMachine>(
    id: string,
    { initials: _initials, ...rest }: ChildS2<E, P, Pc, Tc, T>,
  ) => {
    const reduced = reduceFnMap(
      this.#machine.eventsMap,
      this.#machine.promiseesMap,
      _initials,
    );

    const initials = reduced(this.#cloneState);

    const child = castings.commons<ChildS<E, P, Pc, T>>({
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
  #sendTo = <T extends EventObject>(to: string, event: T) => {
    const service = this.#childrenServices.find(({ id }) => id === to);

    if (service) service.send(castings.commons(event));
  };

  /**
   * Performs some computations to reduce a child machine configuration to a service and subscribes to it.
   *
   * @param : {@linkcode ChildS} - The child machine configuration to reduce.
   * @param id - The unique identifier for the child service.
   * @returns a {@linkcode SubscriberClass} result of the child service subscription.
   */
  #reduceChild = <T extends AnyMachine = AnyMachine>(
    { subscribers, machine, initials }: ChildS<E, P, Pc, T>,
    id: string,
  ) => {
    let service = castings.commons<InterpreterFrom<T>>(
      this.#childrenServices.find(f => f.id === id),
    );

    if (!service) {
      service = this.interpretChild(machine, initials);
      service.id = id;
      this.#childrenServices.push(castings.commons(service));
    }

    const subscriber = service.subscribe(
      ({ event }) => {
        const type = eventToType(event);
        const _subscribers = toArray.typed(subscribers);

        _subscribers.forEach(({ contexts, events }) => {
          const type2 = eventToType(service.#event);

          const checkEvents = reduceEvents(
            castings.commons.any(events),
            type,
            type2,
          );

          const checkContexts = !isDefined(contexts);
          if (checkEvents) {
            if (checkContexts) {
              const pContext = castings.commons.any(service.#context);
              const callback = () => this.#mergeContexts({ pContext });
              this.#schedule(callback);
            } else {
              type _Contexts = types.SingleOrArray<
                string | Record<string, string | string[]>
              >;
              const _contexts =
                castings.commons.unknown<_Contexts>(contexts);
              const paths = toArray.typed(_contexts);

              paths.forEach(path => {
                if (typeof path === 'string') {
                  const callback = () =>
                    assignByKey(this.#pContext, path, service.#context);
                  this.#schedule(callback);
                } else {
                  const entries = Object.entries(path).map(
                    ([key, value]) => {
                      const paths = toArray.typed(value);
                      return castings.arrays.tupleOf(key, paths);
                    },
                  );

                  entries.forEach(([pathChild, paths]) => {
                    paths.forEach(path => {
                      const pContext = mergeByKey(this.#pContext)(
                        path,
                        getByKey(service.#context, pathChild),
                      );

                      const callback = () =>
                        this.#mergeContexts({ pContext });
                      this.#schedule(callback);
                    });
                  });
                }
              });
            }
          }
        });
      },
      { id },
    );

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
    const out = asyncfy(this[Symbol.dispose]);
    return out();
  };
  // #endregion
}

export const TIME_TO_RINIT_SELF_COUNTER = DEFAULT_MIN_ACTIVITY_TIME * 2;

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
export type InterpreterFrom<M extends AnyMachine> = Interpreter<
  ConfigFrom<M>,
  PrivateContextFrom<M>,
  ContextFrom<M>,
  EventsMapFrom<M>,
  PromiseesMapFrom<M>,
  MachineOptionsFrom<M>
>;

export const _interpret: any = (machine: any, args: any) => {
  const { context, pContext, mode, exact } = args ?? {};
  const out = new (Interpreter as any)(machine, mode, exact);

  out._ppC(pContext ?? {});
  out._provideContext(context ?? {});

  return out as any;
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
export const interpret: Interpreter_F = _interpret;
