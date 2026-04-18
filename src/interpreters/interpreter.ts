import { toAction, type ActionConfig } from '#actions';
import _any from '#bemedev/features/common/castings/any';
import isPrimitive from '#bemedev/features/common/castings/primitive/is';
import {
  DEFAULT_DELIMITER,
  DEFAULT_MAX_SELF_TRANSITIONS,
  DEFAULT_MAX_TIME_PROMISE,
  DEFAULT_MIN_ACTIVITY_TIME,
} from '#constants';

import toArray from '#bemedev/features/arrays/castings/toArray';
import isDefined from '#bemedev/features/common/castings/is/defined';
import { switchV } from '#bemedev/features/functions/functions/switch';
import { toDelay } from '#delays';
import {
  ALWAYS_EVENT,
  eventToType,
  INIT_EVENT,
  possibleEvents,
  transformEventArg,
  type ActorsConfigMap,
  type EventArg,
  type EventArgT,
  type EventObject,
  type EventsMap,
  type ToEventsR,
} from '#events';
import { toPredicate, type GuardConfig } from '#guards';
import { getEntries, getExits } from '#machine';
import {
  getByKey,
  getTags,
  toChildSrc,
  type Config,
  type ConfigFrom,
  type ContextFrom,
  type DirectMerge_F,
  type EventsMapFrom,
  type ExtendedActionsParams,
  type PrivateContextFrom,
  type ScheduledData,
} from '#machines';
import {
  flatMap,
  initialConfig,
  nextSV,
  Node,
  nodeToValue,
  resolveNode,
  type ActivityConfig,
  type NodeConfig,
  type State,
  type StateExtended,
  type StateValue,
} from '#states';
import type {
  AlwaysConfig,
  DelayedTransitions,
  TransitionConfig,
} from '#transitions';
import {
  IS_TEST,
  isStringEmpty,
  reduceDescriber,
  replaceAll,
} from '#utils';
import {
  anyPromises,
  asyncfy,
  withTimeout,
  type TimeoutPromise,
} from '@bemedev/better-promise';

import { assignByKey, decomposeSV } from '@bemedev/decompose';
import {
  createInterval,
  createTimeout,
  type Interval2,
  type Timeout2,
} from '@bemedev/interval2';
import { sleep } from '@bemedev/sleep';
import cloneDeep from 'clone-deep';
import equal from 'fast-deep-equal';
import { isDescriber, type RecordS } from '~types';
import type {
  _Send_F,
  AddSubscriber_F,
  AnyInterpreter,
  Collected0,
  CollectedPausable,
  CollectedService,
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
  PerformTransition_F,
  PerformTransitions_F,
  Selector_F,
  WorkingStatus,
} from './interpreter.types';

import type { FinallyConfig } from '#actor';
import _unknown from '#bemedev/features/common/castings/_unknown';
import type {
  AllowedNames,
  Fn,
  PrimitiveObject,
} from '#bemedev/globals/types';
import { toEmitterSrc, type EmitterFunction2 } from '#emitters';
import type { Machine } from '#machine';
import type { ActorsMapFrom, AnyMachine, ChildFunction2 } from '#machines';
import { createScheduler } from '@bemedev/scheduler';
import type { ChildConfig, EmitterConfig } from '../actor.types';
import { createSubscriber, type SubscriberClass } from './subscriber';

/**
 * The `Interpreter` class is responsible for interpreting and managing the state of a machine.
 * It provides methods to start, stop, pause, and resume the machine, as well as to send events
 * and subscribe to state changes.
 *
 * @template : type {@linkcode Config} [C] - The configuration type of the machine.
 * @template : [Pc] - The private context type, which can be any type.
 * @template : type {@linkcode types} [Tc] - The context type.
 * @template : type {@linkcode EventsMap} [E] - The events map type, which maps event names to their
 * @template : type {@linkcode PromiseeMap} [P] - The promisees map type, which maps promise names to their
 * @template Mo : type {@linkcode MachineOptions} - The machine options type, which includes various configurations for the machine. Default to {@linkcode MachineOptions}.
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
  const Pc = any,
  const Tc extends PrimitiveObject = PrimitiveObject,
  E extends EventsMap = EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
  Ta extends string = string,
  Eo extends EventObject = EventObject,
  AllPaths extends string = string,
> implements AnyInterpreter<E, A, Pc, Tc> {
  /**
   * The {@linkcode Machine} machine being interpreted.
   */
  #machine: Machine<C, Pc, Tc, E, A, Ta, Eo, AllPaths>;

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
  readonly #initialNode: Node<Eo, Pc, Tc, Ta>;

  /**
   * The current {@linkcode Node} of this {@linkcode Interpreter} service.
   */
  #node!: Node<Eo, Pc, Tc, Ta>;

  /**
   * an iiner ietrator to count the number of operations performed by this {@linkcode Interpreter} service.
   */
  #iterator = 0;

  /**
   * The current {@linkcode ToEvents} event of this {@linkcode Interpreter} service.
   */
  #event: Eo = transformEventArg(INIT_EVENT);

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
   * The previous {@linkcode State} of this {@linkcode Interpreter} service.
   */
  #previousState!: State<Eo, Tc, Ta>;

  /**
   * The current {@linkcode State} of this {@linkcode Interpreter} service.
   */
  #state!: State<Eo, Tc, Ta>;

  /**
   * All {@linkcode AnyInterpreter} service subscribers of this {@linkcode Interpreter} service.
   */

  #sent = false;

  /**
   * Public getter of the service subscribers of this {@linkcode Interpreter} service.
   */
  get children() {
    return this.#collectedChildren;
  }

  /**
   * Returns a service subscriber of this {@linkcode Interpreter} service with a specific id.
   * @param id - The id of the service subscriber to get.
   * @return The service subscriber {@linkcode AnyInterpreter} of this {@linkcode Interpreter} service with the specified id, or undefined if not found.
   *
   * @see {@linkcode children} for all children.
   */
  getChildAt = (id: string) => this.children.find(f => f.id === id);

  /**
   * Allias of {@linkcode getChildAt} function.
   */
  at = this.getChildAt;

  /**
   * The id of the current {@linkcode Interpreter} service.
   * Used for child machines identification.
   */
  id?: string;

  from?: string;

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

  get tags() {
    return getTags<Ta>(this.#config);
  }

  readonly #schedulerValue = createScheduler();
  readonly #schedulerContexts = createScheduler();
  readonly #schedulerEvent = createScheduler();
  readonly #schedulerStatus = createScheduler();

  /**
   * Where everything is initialized
   * @param machine, the {@linkcode Machine} to interpret.
   * @param mode, the {@linkcode Mode} of the interpreter, default is 'strict'.
   * @param exact, whether to use exact intervals or not, default is false.
   */
  constructor(
    machine: AnyMachine<E, A, Pc, Tc>,
    mode: Mode = 'strict',
    exact = true,
  ) {
    this.#machine = machine.renew;
    this.#config = this.#initialConfig = this.#machine.initialConfig;
    this.#initialNode = this.#resolveNode(this.#initialConfig);
    this.#mode = mode;
    this.#exact = exact;
    this.#performConfig(true);

    this.#state = this.#previousState = {
      status: this.#status,
      context: this.#context,
      event: { type: INIT_EVENT, payload: {} } as any,
      value: this.#value,
      tags: this.tags,
    };

    this.#collectEmitterConfigs();
    this.#collectChildrenConfig();
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

  get #schedulers() {
    return [
      this.#schedulerValue,
      this.#schedulerContexts,
      this.#schedulerEvent,
      this.#schedulerStatus,
    ];
  }

  // #startSchedulers = () => {
  //   this.#schedulers.forEach(this.#start);
  // };

  #stopSchedulers = () => {
    this.#schedulers.forEach(this.#stop);
  };

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
  #performStates = (parts?: Partial<State<Eo, Tc, Ta>>) => {
    this.#previousState = cloneDeep(this.#state);
    this.#state = { ...this.#state, ...parts };
    const check = !equal(this.#previousState, this.#state);
    if (check) this.#flush();
  };

  /**
   * Performs computations, after transitioning to the next target, to update the current {@linkcode NodeConfigWithInitials} config state of this {@linkcode Interpreter} service
   */
  protected _performConfig = () => {
    const value = nodeToValue(this.#config as any);
    const cb = () => (this.#value = value);
    this.#schedulerValue.schedule(cb, this.#sent);
    this.#node = this.#resolveNode(this.#config);
    const configForFlat = _unknown<NodeConfig>(this.#config);
    this.#flat = _any(flatMap(configForFlat, true));
  };

  /**
   * Performs computations, to update the current {@linkcode NodeConfigWithInitials} config state of this {@linkcode Interpreter} service
   * @param target, the target to perform the config for.
   */
  #performConfig = (target?: string | true) => {
    if (target === true) {
      this._performConfig();
      const value = this.#value;
      const tags = this.tags;
      return this.#performStates({ value, tags });
    }

    if (target) {
      this.#config = initialConfig(this.proposedNextConfig(target));
      const tags = this.tags;
      this._performConfig();
      const value = this.#value;
      return this.#performStates({ tags, value });
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
    const actorsMap = this.#machine.actorsMap;

    return resolveNode<E, A, Pc, Tc, Ta, Eo>(
      events,
      actorsMap,
      config,
      options as any,
    );
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

  get isReady() {
    return this.#status !== 'idle' && this.#status !== 'stopped';
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
    const check = isPrimitive(this.#context);
    if (check) return undefined as any;
    const out = (path: string) => getByKey(this.#state.context, path);
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
      const check = this.isReady && isPrimitive(this.#pContext);
      const pContext = this.#pContext;
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
  #startStatus = (): WorkingStatus => {
    this.#setStatus('started');
    return 'started';
  };

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
    const all = [...this.#innerSubscribers, ...this.#subscribers];
    all.forEach(({ fn }) => fn(this.#previousState, this.#state));
  };

  /**
   * All actions that are currently scheduled to be performed.
   * @returns an array of {@linkcode Timeout2} that are currently scheduled to be performed.
   */
  #timeoutActions: Timeout2[] = [];

  #startChildren = () => {
    this.#collectedChildren.forEach(({ service }) => {
      service.start();
    });
  };

  #pauseChildren = (
    filter: Parameters<Array<CollectedService>['filter']>[0] = () => true,
  ) => {
    this.#collectedChildren
      .filter(filter)
      .forEach(({ service }) => service.pause());
  };

  #stopChildren = (
    filter: Parameters<Array<CollectedService>['filter']>[0] = () => true,
  ) => {
    this.#collectedChildren.filter(filter).forEach(({ service, id }) => {
      service.stop();
      this.#collectedChildren = this.#collectedChildren.filter(
        f => f.id !== id,
      );
    });
  };

  #resumeChildren = (
    filter: Parameters<Array<CollectedService>['filter']>[0] = () => true,
  ) => {
    this.#collectedChildren
      .filter(filter)
      .forEach(({ service }) => service.resume());
  };

  /**
   * Start this {@linkcode Interpreter} service.
   */
  start = async () => {
    this.#collectChildren();
    this.#collectPausables();
    this.#throwing();
    this.#startStatus();
    this.#startPausables();
    this.#flush();
    this.#startInitialEntries();
    this.#startChildren();
    this.#throwing();
    this._next();
  };

  /**
   * Pause the collection of all currents {@linkcode Interval2} intervals, related to current {@linkcode ActivityConfig}s of this {@linkcode Interpreter} service.
   *
   */
  #pauseAllActivities = () => {
    this._cachedIntervals.forEach(this.#pause);
  };

  /**
   * Used to track number of self transitions
   */
  #selfTransitionsCounter = 0;

  /**
   * Performs all self transitions and activities of this {@linkcode Interpreter} service.
   */
  #next = () => {
    const filter: Parameters<
      Array<{ from: string; id: string }>['filter']
    >[0] = ({ from, id }, _, all) => {
      const isOutside = !this.#isInsideValue(from);

      const hasSiblingsWithSameId = all
        .filter(val => val.from !== from)
        .map(({ id }) => id)
        .includes(id);

      const check1 = isOutside && hasSiblingsWithSameId;
      if (check1) return false;
      return isOutside;
    };

    this.#collectChildren();
    this.#collectPausables();
    this.#selfTransitionsCounter++;
    this.#pauseAllActivities();
    this.#performActivities();
    this.#stopPausables(filter);
    this.#pausePausables(({ from }) => this.#isInsideValue(from));
    this.#pauseChildren(({ from }) => this.#isInsideValue(from));
    this.#stopChildren(filter);
    this.#startChildren();
    this.#resumeChildren(({ from }) => !this.#isInsideValue(from));
    this.#startPausables();
    this.#resumePausables(({ from }) => this.#isInsideValue(from));

    return this.#performSelfTransitions();
  };

  /**
   * Performs all self transitions and activities of this {@linkcode Interpreter} service.
   * @remarks Throw if the number of self transitions exceeds {@linkcode DEFAULT_MAX_SELF_TRANSITIONS}.
   */
  protected _next = async () => {
    // eslint-disable-next-line no-useless-assignment
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
      if (check) this.#flush();

      const duration = Date.now() - startTime;
      const check2 = duration > TIME_TO_RINIT_SELF_COUNTER;
      if (check2) this.#selfTransitionsCounter = 0;
    } while (check);

    this.#selfTransitionsCounter = 0;
  };

  get #cloneState(): StateExtended<Eo, Pc, Tc, Ta> {
    const pContext = cloneDeep(this.#pContext);
    return structuredClone({ pContext, ...this.#state });
  }

  #performAction: PerformActionLater_F<Eo, Pc, Tc, Ta> = action => {
    this._iterate();
    const out = withTimeout(
      async () => action(this.#cloneState),
      'Action timed out',
      ...(this.longRuns ? [] : [DEFAULT_MAX_TIME_PROMISE]),
    );

    return out();
  };

  #performScheduledAction = (scheduled?: ScheduledData<Pc, Tc>) => {
    if (!scheduled) return;
    const { data, ms: timeout, id } = scheduled;
    const callback = () => this.#mergeContexts(data);
    this.#timeoutActions.filter(f => f.id === id).forEach(this.#dispose);
    this.#timeoutActions = this.#timeoutActions.filter(f => f.id !== id);
    const timer = createTimeout({ callback, timeout, id });
    this.#timeoutActions.push(timer);
    timer.start();
  };

  #performSendToAction = (sentEvent?: { to: string; event: any }) => {
    if (!sentEvent) return;
    return this.#sendTo(sentEvent.to, sentEvent.event);
  };

  #performResendAction = async (resend?: EventArg<E>) => {
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
  #performForceSendAction = async (forceSend?: EventArg<E>) => {
    if (!forceSend) return;
    const values = Object.values(this.#machine.flat);

    for (const { on } of values) {
      const type = eventToType(forceSend);
      const transitions = toArray.typed(on?.[type]);
      await this.__performTransitions(...(transitions as any));
    }
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

  #performsExtendedActions = async ({
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
      (await this.#performForceSendAction(forceSend)) ??
      (await this.#performResendAction(resend));

    return result;
  };

  #executeAction: PerformAction_F<Eo, Pc, Tc, Ta> = async action => {
    this.#makeBusy();

    const { pContext, context, ...extendeds } =
      await this.#performAction(action);

    this.#mergeContexts({ pContext, context });
    await this.#performsExtendedActions(extendeds);
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

  #performActions = async (...actions: ActionConfig[]) => {
    const fns = actions.map(this.toActionFn).filter(f => f !== undefined);

    for (const fn of fns) {
      await this.#executeAction(fn);
    }
  };

  #performPredicate: PerformPredicate_F<Eo, Pc, Tc, Ta> = predicate => {
    this._iterate();
    return predicate(this.#cloneState);
  };

  #executePredicate: PerformPredicate_F<Eo, Pc, Tc, Ta> = predicate => {
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

  #performDelay: PerformDelay_F<Eo, Pc, Tc, Ta> = delay => {
    this._iterate();
    return delay(this.#cloneState);
  };

  #executeDelay: PerformDelay_F<Eo, Pc, Tc, Ta> = delay => {
    this.#makeBusy();
    const out = this.#performDelay(delay);
    this.#startStatus();
    return out;
  };

  #mergeContexts: DirectMerge_F<Pc, Tc> = result => {
    const cb = () => {
      this.#pContext = (result?.pContext as any) ?? this.#pContext;
      const context = (result?.context as any) ?? this.#context;
      this.#context = context;
      return this.#performStates({ context });
    };

    return this.#schedulerContexts.schedule(cb, this.#sent);
  };

  #executeActivities: ExecuteActivities_F = (from, _activities) => {
    const entries = Object.entries(_activities);
    const outs: string[] = [];

    for (const [_delay, _activity] of entries) {
      const id = `${from}::${_delay}`;
      let index = -1;
      const _interval = this._cachedIntervals.find((f, i) => {
        const check = f.id === id;
        if (check) index = i;
        return check;
      });

      const buildCallback = () => {
        const delayF = this.toDelayFn(_delay);
        const check0 = !isDefined(delayF);
        if (check0) return;
        const interval = this.#executeDelay(delayF);

        const check11 = interval < DEFAULT_MIN_ACTIVITY_TIME;
        if (check11) {
          this._addWarning(`Delay (${_delay}) is too short`);
          return;
        }

        const check12 = interval > DEFAULT_MAX_TIME_PROMISE;
        if (check12) {
          this._addWarning(`Delay (${_delay}) is too long`);
          return;
        }

        const activities = toArray.typed(_activity);

        const callback = async () => {
          for (const activity of activities) {
            const check2 = typeof activity === 'string';
            const check3 = isDescriber(activity);
            const check4 = check2 || check3;

            if (check4) {
              await this.#performActions(activity);
              continue;
            }

            const check5 = this.#performPredicates(
              ...toArray.typed(activity.guards),
            );
            if (check5) {
              const actions = toArray.typed(activity.actions);
              await this.#performActions(...actions);
            }
          }
        };

        const promise = this.createInterval({
          callback,
          interval,
          id,
        });

        this._cachedIntervals.push(promise);

        return id;
      };

      if (_interval) {
        const check =
          _interval.state === 'idle' || _interval.state === 'paused';
        if (check) {
          this._cachedIntervals.splice(index, 1);
          const result = buildCallback();
          if (!result) return [];
          outs.push(result);
        } else outs.push(id);
        continue;
      }

      const result = buildCallback();
      if (!result) return [];

      outs.push(result);
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

  #performTransition: PerformTransition_F = async transition => {
    const check = typeof transition == 'string';
    if (check) {
      const { diffEntries, diffExits } = this.#diffNext(transition);
      await this.#performActions(...toArray.typed(diffExits));
      await this.#performActions(...toArray.typed(diffEntries));
      return transition;
    }
    const { guards, actions, target } = transition;
    const { diffEntries, diffExits } = this.#diffNext(target);

    const response = this.#performPredicates(
      ...toArray<GuardConfig>(guards),
    );

    if (response) {
      await this.#performActions(...toArray.typed(diffExits));
      await this.#performActions(...toArray.typed(actions));
      await this.#performActions(...toArray.typed(diffEntries));
      return target ?? false;
    }
    return false;
  };

  protected __performTransitions: PerformTransitions_F = async (
    ...transitions
  ) => {
    for (const _transition of transitions) {
      const transition = await this.#performTransition(_transition);
      const check1 = typeof transition === 'string';
      if (check1) return transition;
    }

    return false;
  };

  #performFinally = (_finally?: FinallyConfig) => {
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

  get longRuns() {
    return this.#machine.longRuns;
  }

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
        if (this.#cannotPerform(from)) return false;

        const func = () =>
          this.__performTransitions(...(transitions as any));

        const out = await func();

        if (out === false) {
          const message = `No transitions reached from "${from}" by delay "${_delay}" !`;

          throw message;
        }
        return out;
      };

      const promise = withTimeout(
        _promise,
        from,
        ...(this.longRuns ? [] : [DEFAULT_MAX_TIME_PROMISE]),
      );

      promises.push(promise);
    });

    const check5 = promises.length < 1;
    if (check5) return;

    const promise = anyPromises(from, ...promises);
    return promise;
  };

  #performAlways: PerformAlway_F = alway => {
    this.#changeEvent(transformEventArg(ALWAYS_EVENT));
    const always = toArray<TransitionConfig>(alway);
    return this.__performTransitions(...always);
  };

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
    const collected = this.#collectedActivities.filter(([from]) =>
      this.#isInsideValue(from),
    );
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

  #startPausables = () => {
    this.#collectedPausables.forEach(({ pausable }) => pausable.start());
  };

  #resumePausables = (
    filter: (value: CollectedPausable) => boolean = () => true,
  ) => {
    this.#collectedPausables
      .filter(filter)
      .forEach(({ pausable }) => pausable.resume());
  };

  #stopPausables = (
    filter: Parameters<Array<CollectedPausable>['filter']>[0] = () => true,
  ) => {
    this.#collectedPausables.filter(filter).forEach(({ pausable, id }) => {
      pausable.stop();
      this.#collectedPausables = this.#collectedPausables.filter(
        f => f.id !== id,
      );
    });
  };

  #pausePausables = (
    filter: (value: CollectedPausable) => boolean = () => true,
  ) => {
    this.#collectedPausables
      .filter(filter)
      .forEach(({ pausable }) => pausable.pause());
  };

  /**
   * Get all brut self transitions of the current {@linkcode NodeConfigWithInitials} config state of this {@linkcode Interpreter} service.
   */
  get #collectedSelfTransitions0() {
    const entries = new Map<string, Collected0>();

    this.#collectedAlways.forEach(([from, always]) => {
      entries.set(from, { always: () => this.#performAlways(always) });
    });

    this.#collectedAfters.forEach(([from, after]) => {
      const inner = entries.get(from);
      if (inner) {
        inner.after = this.#performAfter(from, after);
      } else entries.set(from, { after: this.#performAfter(from, after) });
    });

    return entries;
  }

  /**
   * Changes the current {@linkcode ToEvents} event of this {@linkcode Interpreter} service.
   *
   * @param event - the {@linkcode ToEventsR} event to change the current {@linkcode Interpreter} service state.
   */
  #changeEvent = (event: Eo) => {
    const cb = () => {
      this.#performStates({ event });
      this.#event = event;
    };

    return this.#schedulerEvent.schedule(cb, this.#sent);
  };

  get #collectedSelfTransitions() {
    const entries = Array.from(this.#collectedSelfTransitions0).filter(
      ([from]) => this.#isInsideValue(from),
    );

    const out = entries.map(([from, { after, always }]) => {
      const promise = async () => {
        if (always) {
          const target = await always();
          if (target !== false) return this.#performConfig(target);
        }

        // const promises: TimeoutPromise<void>[] = [];
        if (after) {
          const _after = async () => {
            await after()
              .then(transition => {
                if (transition !== false)
                  return this.#performConfig(transition);
              })
              .catch(() =>
                this._addWarning(
                  `${from}::after - No transitions reached!`,
                ),
              );
          };
          await _after();
        }
      };

      return withTimeout(promise, 'self-transition');
    });

    if (out.length < 1) return;
    return anyPromises('self-transition', ...out);
  }

  #collectedEmitterConfigs: [
    from: string,
    ...promisees: (EmitterConfig & { id: string })[],
  ][] = [];

  #collectEmitterConfigs = () => {
    const entriesFlat = Object.entries(this.#machine.flat);
    const entries: [
      from: string,
      ...promisees: (EmitterConfig & { id: string })[],
    ][] = [];

    entriesFlat.forEach(([from, node]) => {
      const actors = Object.entries(node.actors ?? {});
      const promisees = toArray
        .typed(actors)
        .map(([id, actor]) => ({ ...actor, id }))
        .filter(actor => 'next' in actor);
      if (node.actors) {
        entries.push([from, ...promisees]);
      }
    });

    this.#collectedEmitterConfigs.push(...entries);
    return entries;
  };

  #collectedChildrenConfig: [
    from: string,
    ...promisees: (ChildConfig & { id: string })[],
  ][] = [];

  #collectChildrenConfig = () => {
    const entriesFlat = Object.entries(this.#machine.flat);
    const entries: [
      from: string,
      ...promisees: (ChildConfig & { id: string })[],
    ][] = [];

    entriesFlat.forEach(([from, node]) => {
      const actors = Object.entries(node.actors ?? {});
      const promisees = toArray
        .typed(actors)
        .map(([id, actor]) => ({ ...actor, id }))
        .filter(actor => 'on' in actor || 'contexts' in actor);
      if (node.actors) {
        entries.push([from, ...promisees]);
      }
    });

    this.#collectedChildrenConfig.push(...entries);
    return entries;
  };

  #collectedPausables: CollectedPausable[] = [];

  #collectPausables = () => {
    type _Emitter = EmitterConfig & {
      emitterFn: EmitterFunction2<Eo, Pc, Tc, Ta>;
      id: string;
    };
    return this.#collectedEmitterConfigs
      .filter(([from]) => this.#isInsideValue(from))
      .filter(([from]) => {
        const froms = this.#collectedPausables.map(({ from }) => from);
        return !froms.includes(from);
      })
      .map(([from, ..._emitters]) => {
        const emitters = _emitters
          .map(({ id, ...rest }) => {
            return { emitterFn: this.toEmitterSrc(id), ...rest, id };
          })
          .filter(({ emitterFn }) => !!emitterFn) as _Emitter[];

        return [from, ...emitters] as const;
      })
      .map(([from, ...emitters]) => {
        const pausables = emitters.map(
          ({ emitterFn, error, next, complete, id }) => {
            const pausable = emitterFn(this.#cloneState);

            // Wire the interpreter's transition callbacks into the pausable.
            pausable.subscribe({
              next: payload => {
                const event = {
                  type: `${id}::next`,
                  payload,
                } satisfies EventObject;

                this.#changeEvent(_any(event));
                const transitions = toArray<TransitionConfig>(next);
                this.__performTransitions(...transitions);
              },
              error: payload => {
                const event = {
                  type: `${id}::error`,
                  payload,
                } satisfies EventObject;

                this.#changeEvent(_any(event));
                const transitions = toArray<TransitionConfig>(error);
                this.__performTransitions(...transitions);
              },
              complete: () => this.#performFinally(complete),
            });

            // // Branch on the interpreter's current status so that pausables
            // // collected during an active session start immediately, while
            // // those collected during initial start-up are left in 'stopped'
            // // state and started by the subsequent #startPausables() call.
            // switch (this.#status) {
            //   case 'started':
            //   case 'working':
            //   case 'sending':
            //   case 'busy':
            //     pausable.start();
            //     break;
            //   case 'paused':
            //     pausable.start();
            //     pausable.pause();
            //     break;
            //   // 'idle' | 'starting' | 'stopped' → #startPausables() handles it
            // }

            return {
              pausable,
              id,
              from,
            };
          },
        );

        this.#collectedPausables.push(...pausables);
        return pausables;
      })
      .flat();
  };

  #collectedChildren: CollectedService[] = [];
  #collectChildren = () => {
    type _Child = ChildConfig & {
      childFn: ChildFunction2<Eo, Pc, Tc, Ta>;
      id: string;
    };

    return this.#collectedChildrenConfig
      .filter(([from]) => this.#isInsideValue(from))
      .filter(([from]) => {
        const froms = this.#collectedChildren.map(({ from }) => from);
        return !froms.includes(from);
      })
      .map(([from, ..._children]) => {
        const children = _children
          .map(({ id, ...rest }) => {
            return { childFn: this.toChildFunction(id), ...rest, id };
          })
          .filter(({ childFn }) => !!childFn) as _Child[];

        return [from, ...children] as const;
      })
      .map(([from, ..._children]) => {
        const services = _children.map(({ childFn, ...rest }) => {
          const service = this.#executeChild(childFn);
          return {
            service,
            ...rest,
          };
        });

        return [from, ...services] as const;
      })
      .map(([from, ..._services]) => {
        const services = _services.map(({ service, on, contexts, id }) => {
          const si = service as AnyInterpreter & {
            __subscribe: AddSubscriber_F;
          };

          const checkOn = on !== undefined && Object.keys(on).length > 0;
          if (checkOn) {
            si.__subscribe(
              payload => {
                const type = eventToType(payload.event);

                const event = {
                  type: `${id}::on::${type}`,
                  payload,
                } satisfies EventObject;

                this.#changeEvent(_any(event));
                const transitions = toArray<TransitionConfig>(on?.[type]);
                this.__performTransitions(...transitions);
              },
              {
                equals: (a, b) => a.event.type === b.event.type,
                id: `${id}::on`,
              },
            );
          }

          const checkContexts =
            contexts !== undefined && Object.keys(contexts).length > 0;

          if (checkContexts) {
            si.__subscribe(
              ({ context }) => {
                const entries = Object.entries(contexts);
                entries.forEach(([key, path]) => {
                  const pContext =
                    key === '.'
                      ? structuredClone(context)
                      : getByKey.low(context, key);

                  if (path === '.')
                    return this.#mergeContexts({ pContext });
                  const cb = () => {
                    return assignByKey.low(this.#pContext, path, pContext);
                  };
                  this.#schedulerContexts.schedule(cb);
                });
              },
              {
                equals: (a, b) => {
                  const ac = a.context;
                  const bc = b.context;
                  if (equal(ac, bc)) return true;
                  const keys = Object.keys(contexts);

                  for (const key of keys) {
                    if (key === '.') return equal(ac, bc);
                    const _a = getByKey.low(ac, key);
                    const _b = getByKey.low(bc, key);
                    if (!equal(_a, _b)) return false;
                  }

                  return true;
                },
                id: `${id}::contexts`,
              },
            );
          }

          return {
            service: si,
            id,
            from,
          };
        });

        this.#collectedChildren.push(...services);
        return services;
      });
  };

  #executeChild = (child: ChildFunction2<Eo, Pc, Tc, Ta>) => {
    const instance = child(this.#cloneState);
    return instance;
  };

  #performSelfTransitions = async () => {
    this.#makeBusy();
    const previousState = structuredClone(this.#state);
    await this.#collectedSelfTransitions?.();
    const nextState = structuredClone(this.#state);
    const check = !equal(previousState, nextState);
    if (check) this.#flush();
    this.#makeWork();
  };

  #startInitialEntries = () => {
    const actions = getEntries(this.#initialConfig);
    if (actions.length < 1) return;
    this.#performActions(...actions);
  };

  /**
   * @deprecated
   * A mapper function that returns a function to call a method on a value.
   * @param key - the key of the method to be called on the value.
   * @returns a function that calls the method on the value.
   *
   * @see {@linkcode AllowedNames} for more information about allowed names.
   * @see {@linkcode Fn} for more information about function
   */
  #mapperFn = <T>(key: AllowedNames<T, Fn>) => {
    return (value: T) => (value as any)[key]();
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
    this.#pauseChildren();
    this.#pausePausables();
    this.#timeoutActions.forEach(this.#pause);
    this.#setStatus('paused');
  };

  resume = () => {
    if (this.#status === 'paused') {
      this.#performActivities();
      this.#makeBusy();
      this.#subscribers.forEach(this.#open);
      this.#timeoutActions.forEach(this.#resume);
      this.#resumeChildren();
      this.#resumePausables();
      this.#makeWork();
    }
  };

  stop = () => {
    this.pause();
    this.#makeBusy();
    this.#subscribers.forEach(this.#unsubscribe);
    this.#stopChildren();
    this._cachedIntervals.forEach(this.#dispose);
    this.#timeoutActions.forEach(this.#stop);
    this.#stopPausables();
    this.#setStatus('stopped');
    this.#stopSchedulers();
  };

  #makeBusy = (): WorkingStatus => {
    this.#setStatus('busy');
    return 'busy';
  };

  #setStatus = (status: WorkingStatus) => {
    const cb = () => {
      this.#performStates({ status });
      return (this.#status = status);
    };

    return this.#schedulerStatus.schedule(cb, this.#sent);
  };

  #startingStatus = (): WorkingStatus => {
    this.#setStatus('starting');
    return 'starting';
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

  /**
   * Provides options for the interpreter and returns a new interpreter instance.
   *
   * @param option a function that provides options for the machine.
   * Options can include actions, predicates, delays, promises, and child machines.
   * @returns a new interpreter instance with the provided options applied.
   */
  provideOptions = (
    option: Parameters<(typeof this)['addOptions']>[0],
  ) => {
    const newMachine = this.#machine.provideOptions(option);
    const out = new Interpreter(newMachine, this.#mode, this.#exact);
    out._ppC(this.#initialPpc);
    out._provideContext(this.#initialContext);
    return out;
  };

  #subscribers = new Set<SubscriberClass<E, A, Tc, Ta, Eo>>();
  #innerSubscribers = new Set<SubscriberClass<E, A, Tc, Ta, Eo>>();

  // @ts-expect-error Already used recursively
  subscribe: AddSubscriber_F<E, A, Tc, Ta, Eo> = (
    _subscriber,
    options,
  ) => {
    const eventsMap = this.#machine.eventsMap;
    const actorsMap = this.#machine.actorsMap;
    const find = Array.from(this.#subscribers).find(
      f => f.id === options?.id,
    );
    if (find) return find;

    const subcriber = createSubscriber(
      eventsMap,
      actorsMap,
      _subscriber,
      options,
    );
    this.#subscribers.add(subcriber);
    return subcriber as any;
  };

  // @ts-expect-error Already used recursively
  private __subscribe: AddSubscriber_F<E, A, Tc, Ta, Eo> = (
    _subscriber,
    options,
  ) => {
    const eventsMap = this.#machine.eventsMap;
    const actorsMap = this.#machine.actorsMap;

    const subscriber = createSubscriber(
      eventsMap,
      actorsMap,
      _subscriber,
      options,
    );
    this.#innerSubscribers.add(subscriber);
    return subscriber;
  };

  get state() {
    return Object.freeze(cloneDeep(this.#state));
  }

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

  #extractTransitions = (event: Eo) => {
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

  protected _send: _Send_F<Eo> = async event => {
    this.#sent = true;
    this.#changeEvent(event);
    this.#setStatus('sending');
    let sv = this.#value;

    const flat2 = this.#extractTransitions(event);
    // #endregion

    for (const [from, transitions] of flat2) {
      const cannotContinue = !this.#isInsideValue2(sv, from);
      if (cannotContinue) continue;

      const target = await this.__performTransitions(
        ...toArray.typed(transitions),
      );

      const diffTarget = target === false ? undefined : target;
      sv = nextSV(sv, diffTarget);
    }

    const next = switchV({
      condition: equal(this.#value, sv),
      truthy: undefined,
      falsy: initialConfig(this.#machine.valueToConfig(sv)),
    });

    this.#sent = false;
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
    type Arg = Extract<ToEventsR<E, A>, { type: T }>['payload'];
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
  #send = async (_event: EventArg<E>) => {
    const event = transformEventArg(_event);
    const next = await this._send(event as any);

    if (isDefined(next)) {
      this.#config = next;
      this.#performConfig(true);
      this.#makeWork();
      this._next();
    } else return this.#makeWork();
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
  send = async (_event: EventArg<E>) => {
    const check = this.#cannotPerformEvents(_event);
    if (check) return;
    return this.#send(_event);
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
  //  * @see {@linkcode Machine.valueToConfig} for more details.
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

    const next = _unknown<NodeConfig>(
      initialConfig(_unknown(this.proposedNextConfig(target))),
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
    const out = this.#isInsideValue2(this.#value, value);
    return out;
  };

  #isInsideValue2 = (sv: StateValue, value: string) => {
    if (value === DEFAULT_DELIMITER) {
      return true;
    }
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
    const actorsMap = this.#machine.actorsMap;
    const actions = this.#machine.actions;

    return this.#returnWithWarning(
      toAction<E, A, Pc, Tc, Ta, Eo>(events, actorsMap, action, actions),
      `Action (${reduceDescriber(action)}) is not defined`,
    );
  };

  toPredicateFn = (guard: GuardConfig) => {
    const events = this.#machine.eventsMap;
    const actorsMap = this.#machine.actorsMap;
    const predicates = this.#machine.predicates;

    const { predicate, errors } = toPredicate<E, A, Pc, Tc, Ta, Eo>(
      events,
      actorsMap,
      guard,
      predicates,
    );

    return this.#returnWithWarning(predicate, ...errors);
  };

  toDelayFn = (delay: string) => {
    const events = this.#machine.eventsMap;
    const actorsMap = this.#machine.actorsMap;
    const delays = this.#machine.delays;

    return this.#returnWithWarning(
      toDelay<E, A, Pc, Tc, Ta, Eo>(events, actorsMap, delay, delays),
      `Delay (${delay}) is not defined`,
    );
  };

  toChildFunction = (machine: string) => {
    const events = this.#machine.eventsMap;
    const actorsMap = this.#machine.actorsMap;
    const machines = this.#machine.children;

    return this.#returnWithWarning(
      toChildSrc<E, A, Pc, Tc, Ta>(
        events,
        actorsMap,
        machine,
        machines as any,
      ),
      `Machine (${reduceDescriber(machine)}) is not defined`,
    );
  };

  toEmitterSrc = (emitter: string) => {
    const events = this.#machine.eventsMap;
    const actorsMap = this.#machine.actorsMap;
    const emitters = this.#machine.emitters;

    return this.#returnWithWarning(
      toEmitterSrc<E, A, Pc, Tc, Ta>(
        events,
        actorsMap,
        emitter,
        emitters as any,
      ),
      `Emitter (${reduceDescriber(emitter)}) is not defined`,
    );
  };

  protected interpretChild = interpret;

  /**
   * Sends an event to a specific child service by its ID.
   *
   * @param to - The ID of the child service to which the event will be sent.
   * @param : the {@linkcode EventObject} event to send to the child service.
   *
   * @see {@linkcode send} for sending events to the current service.
   */
  #sendTo = async <T extends EventObject>(to: string, event: T) => {
    const collector = this.#collectedChildren.filter(
      ({ from, id }) => this.#isInsideValue(from) && id === to,
    );

    for (const { service } of collector) {
      await service.send(event);
    }
  };

  // #region Disposable

  dispose = () => {
    this.stop();
    this.#collectedChildren.forEach(({ service }) => service.dispose());
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
  ActorsMapFrom<M>
>;

/**
 * Creates an {@linkcode Interpreter} service from the given {@linkcode MachineConfig} machine.
 *
 * @param machine - The {@linkcode MachineConfig} machine to create the interpreter from.
 * @param options - The options for the interpreter, including context, private context, mode, and exact.
 * @returns an {@linkcode Interpreter} service.
 *
 * @see {@linkcode MachineConfig}
 */
export const interpret: Interpreter_F = (..._args) => {
  const [machine, args] = _args;
  const { mode, exact, pContext, context } = args ?? {};
  const out: any = new Interpreter(machine, mode, exact);
  out._providePrivateContext(pContext);
  out._provideContext(context);
  return out;
};
