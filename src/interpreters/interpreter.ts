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
import type { SingleOrArray } from '@bemedev/boolean-recursive';
import { decomposeSV } from '@bemedev/decompose';
import { createInterval, type Interval2 } from '@bemedev/interval2';
import sleep from '@bemedev/sleep';
import { t } from '@bemedev/types';
import cloneDeep from 'clone-deep';
import equal from 'fast-deep-equal';
import {
  reduceAction,
  toAction,
  type ActionConfig,
  type ActionResult,
} from '~actions';
import {
  DEFAULT_DELIMITER,
  MAX_SELF_TRANSITIONS,
  MAX_TIME_PROMISE,
  MIN_ACTIVITY_TIME,
} from '~constants';
import { toDelay } from '~delays';
import {
  AFTER_EVENT,
  ALWAYS_EVENT,
  eventToType,
  INIT_EVENT,
  possibleEvents,
  transformEventArg,
  type EventArg,
  type EventArgT,
  type EventObject,
  type EventsMap,
  type PromiseeMap,
  type ToEvents,
  type ToEventsR,
} from '~events';
import { toPredicate, type GuardConfig } from '~guards';
import { getEntries, getExits, type Machine } from '~machine';
import {
  assignByKey,
  getByKey,
  mergeByKey,
  reduceEvents,
  toMachine,
  type AnyMachine,
  type Config,
  type ConfigFrom,
  type ContextFrom,
  type EventsMapFrom,
  type GetEventsFromConfig,
  type MachineConfig,
  type MachineOptions,
  type MachineOptionsFrom,
  type PrivateContextFrom,
  type PromiseesMapFrom,
  type ScheduledData,
  type SimpleMachineOptions2,
} from '~machines';
import {
  PromiseConfig,
  toPromiseSrc,
  type PromiseeResult,
} from '~promises';
import {
  flatMap,
  initialConfig,
  nextSV,
  nodeToValue,
  resolveNode,
  type ActivityConfig,
  type Node,
  type NodeConfig,
  type NodeConfigWithInitials,
  type StateValue,
} from '~states';
import type {
  AlwaysConfig,
  DelayedTransitions,
  TransitionConfig,
} from '~transitions';
import { isDescriber, type PrimitiveObject, type RecordS } from '~types';
import { IS_TEST, reduceFnMap, replaceAll, typings } from '~utils';
import { ChildS, type ChildS2 } from './../machine/types';
import { merge } from './../utils/merge';
import {
  type _Send_F,
  type AddSubscriber_F,
  type AnyInterpreter,
  type Collected0,
  type CreateInterval2_F,
  type ExecuteActivities_F,
  type Interpreter_F,
  type Mode,
  type PerformAction_F,
  type PerformAfter_F,
  type PerformAlway_F,
  type PerformDelay_F,
  type PerformPredicate_F,
  type PerformPromise_F,
  type PerformPromisee_F,
  type PerformTransition_F,
  type PerformTransitions_F,
  type Selector_F,
  type State,
  type WorkingStatus,
} from './interpreter.types';
import { Scheduler } from './scheduler';
import {
  createSubscriber,
  type SubscriberClass,
  type SubscriberOptions,
} from './subscriber';
import {
  createSubscriberMap,
  type SubscriberMapClass,
} from './subscriberMap';

/**
 * The `Interpreter` class is responsible for interpreting and managing the state of a machine.
 * It provides methods to start, stop, pause, and resume the machine, as well as to send events
 * and subscribe to state changes.
 *
 * @template C - The configuration type for the machine.
 * @template Pc - The private context type.
 * @template Tc - The context type.
 * @template E - The events map type.
 * @template P - The promise map type.
 * @template Mo - The machine options type.
 *
 * @implements {AnyInterpreter<E, P, Pc, Tc>}
 */
export class Interpreter<
  const C extends Config = Config,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  E extends EventsMap = GetEventsFromConfig<C>,
  P extends PromiseeMap = PromiseeMap,
  Mo extends SimpleMachineOptions2 = MachineOptions<C, E, P, Pc, Tc>,
> implements AnyInterpreter<E, P, Pc, Tc>
{
  #machine: Machine<C, Pc, Tc, E, P, Mo>;
  #status: WorkingStatus = 'idle';
  #config: NodeConfigWithInitials;
  #flat!: RecordS<NodeConfigWithInitials>;
  #value!: StateValue;
  #mode: Mode;
  readonly #initialNode: Node<E, P, Pc, Tc>;
  #node!: Node<E, P, Pc, Tc>;
  #iterator = 0;
  #event: ToEvents<E, P> = INIT_EVENT;
  readonly #initialConfig: NodeConfigWithInitials;
  #initialPpc!: Pc;
  #initialContext!: Tc;
  #pContext!: Pc;
  #context!: Tc;
  #scheduler: Scheduler;
  #subscribers = new Set<SubscriberClass<Tc>>();

  #previousState!: State<Tc>;
  #state!: State<Tc>;

  #childrenServices: (AnyInterpreter2 & { id: string })[] = [];

  get children() {
    return this.#childrenServices;
  }

  getChildAt = (id: string) => this.children.find(f => f.id === id);
  at = this.getChildAt;

  get #childrenMachines() {
    const _machines = toArray.typed(this.#machine.preConfig.machines);
    return _machines.map(this.toMachine).filter(isDefined);
  }

  id?: string;

  get mode() {
    return this.#mode;
  }

  get event() {
    return this.#event;
  }

  get eventsMap() {
    return this.#machine.eventsMap;
  }

  get scheduleds() {
    return this.#scheduler.performeds;
  }

  constructor(
    machine: Machine<C, Pc, Tc, E, P, Mo>,
    mode: Mode = 'strict',
    exact = false,
  ) {
    this.#machine = machine.renew;

    this.#initialConfig = this.#machine.initialConfig;
    this.#initialNode = this.#resolveNode(this.#initialConfig);
    this.#mode = mode;
    this.#config = this.#initialConfig;
    this.#exact = exact;
    this.#performConfig(true);
    this.#scheduler = new Scheduler();
    this.#state = this.#previousState = {
      status: this.#status,
      context: this.#context,
      event: this.#event,
      value: this.#value,
      tags: this.#config.tags,
    };

    this.#throwing();
  }

  get isStrict() {
    return this.#mode === 'strict';
  }

  get isNormal() {
    return this.#mode === 'normal';
  }

  get isStrictest() {
    return this.#mode === 'strictest';
  }

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

    /* v8 ignore next 12 */
    if (this.isStrictest) {
      const _errors = [
        ...this.#errorsCollector,
        ...this.#warningsCollector,
      ];

      const check5 = _errors.length > 0;
      if (check5) {
        const errors = this.#displayConsole(_errors);
        throw new Error(errors);
      }
    }
  };

  #performStates = (parts?: Partial<State<Tc>>) => {
    this.#previousState = cloneDeep(this.#state);
    this.#state = { ...this.#state, ...parts };
    this.#flush();
  };

  protected _performConfig = () => {
    const value = nodeToValue(this.#config);
    this.#value = value;
    this.#performStates({ value });
    this.#node = this.#resolveNode(this.#config);

    const configForFlat = t.unknown<NodeConfig>(this.#config);
    this.#flat = t.any(flatMap(configForFlat));
  };

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

  #resolveNode = (config: NodeConfigWithInitials) => {
    const options = this.#machine.options;
    const events = this.#machine.eventsMap;
    const promisees = this.#machine.promiseesMap;

    return resolveNode<E, P, Pc, Tc>(events, promisees, config, options);
  };

  get initialNode() {
    return this.#initialNode;
  }

  get node() {
    return this.#node;
  }

  makeStrict = () => {
    this.#mode = 'strict';
  };

  makeStrictest = () => {
    this.#mode = 'strictest';
  };

  makeNormal = () => {
    this.#mode = 'normal';
  };

  get status() {
    return this.#status;
  }

  get initialConfig() {
    return this.#machine.initialConfig;
  }

  get initialValue() {
    return this.#machine.initialValue;
  }

  get config() {
    return this.#config;
  }

  get renew() {
    const out = new Interpreter(this.#machine);
    out._ppC(this.#initialPpc);
    out._provideContext(this.#initialContext);

    return out;
  }

  get value() {
    return this.#value;
  }

  get context() {
    return this.#context;
  }

  /**
   * @deprecated
   * Just use for testing
   * returns nothing in prod
   */
  get _pContext() {
    if (IS_TEST) {
      return this.#pContext;
      /* v8 ignore next 4 */
    }
    console.error('pContext is not available in production');
    return;
  }

  select: Selector_F<Tc> = selector => getByKey(this.#context, selector);

  /**
   * @deprecated
   * Just use for testing
   * returns nothing in prod
   */
  _pSelect: Selector_F<Pc> = selector => {
    if (IS_TEST) {
      const pContext = this._pContext;
      if (pContext) return getByKey(pContext, selector);
      /* v8 ignore next 4 */
    }
    console.error('pContext is not available in production');
    return;
  };

  #startStatus = (): WorkingStatus => this.#setStatus('started');

  #displayConsole = (messages: Iterable<string>) => {
    return Array.from(messages).join('\n');
  };

  #flush = () => {
    this.#flush2();
    this.#flushSubscribers();
  };

  #timeoutActions: NodeJS.Timeout[] = [];

  start = () => {
    this.#flush();
    this.#throwing();
    this.#startStatus();
    this.#scheduler.initialize(this.#startInitialEntries);
    this.#performChildMachines();
    this.#throwing();

    return this._next();
  };

  #rinitIntervals = () => {
    this._cachedIntervals.forEach(f => {
      const check = f.state === 'active';
      if (check) this.#scheduler.schedule(f.pause.bind(f));
    });
  };

  get #schedule() {
    return this.#scheduler.schedule;
  }

  #flush2 = () => {
    this.#subscribers.forEach(({ fn }) => {
      const callback = () => fn(this.#previousState, this.#state);
      this.#schedule(callback);
    });
  };

  #selfTransitionsCounter = 0;

  #next = async () => {
    this.#selfTransitionsCounter++;
    this.#rinitIntervals();
    this.#performActivities();
    await this.#performSelfTransitions();
  };

  protected _next = async () => {
    let check = false;
    do {
      const startTime = Date.now();
      const previousValue = this.#value;

      const checkCounter =
        this.#selfTransitionsCounter >= MAX_SELF_TRANSITIONS;
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

  #performAction: PerformAction_F<E, P, Pc, Tc> = action => {
    this._iterate();
    const pContext = cloneDeep(this.#pContext);
    const context = structuredClone(this.#context);
    const event = structuredClone(this.#event);

    return action(pContext, context, event);
  };

  #executeAction: PerformAction_F<E, P, Pc, Tc> = action => {
    this.#makeBusy();
    const { pContext, context, __data } = t.any(
      this.#performAction(action),
    );
    if (__data) {
      const { data, ms } = __data as ScheduledData<Pc, Tc>;
      const timer = setTimeout(() => {
        this.#merge(data);
      }, ms);
      this.#timeoutActions.push(timer);
    }
    this.#makeWork();
    return { pContext, context };
  };

  #throwMaxCounter() {
    const error = `Too much self transitions, exceeded ${MAX_SELF_TRANSITIONS} transitions`;
    if (IS_TEST) {
      this._addError(error);
      this.#throwing();
      this.stop();
      /* v8 ignore next 1 */
    } else throw error;
  }

  get #contexts() {
    return t.unknown<ActionResult<Pc, Tc>>({
      pContext: cloneDeep(this.#pContext),
      context: structuredClone(this.#context),
    });
  }

  #performActions = (
    contexts: ActionResult<Pc, Tc>,
    ...actions: ActionConfig[]
  ) => {
    return actions
      .map(this.toAction)
      .filter(f => f !== undefined)
      .map(this.#executeAction)
      .reduce((acc, value) => {
        const out = merge(acc, value);
        return out;
      }, contexts);
  };

  #performPredicate: PerformPredicate_F<E, P, Pc, Tc> = predicate => {
    this._iterate();
    return predicate(
      cloneDeep(this.#pContext),
      structuredClone(this.#context),
      structuredClone(this.#event),
    );
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
      .map(this.toPredicate)
      .filter(isDefined)
      .map(this.#executePredicate)
      .every(b => b);
  };

  #performDelay: PerformDelay_F<E, P, Pc, Tc> = delay => {
    this._iterate();
    return delay(
      cloneDeep(this.#pContext),
      structuredClone(this.#context),
      structuredClone(this.#event),
    );
  };

  #executeDelay: PerformDelay_F<E, P, Pc, Tc> = delay => {
    this.#makeBusy();
    const out = this.#performDelay(delay);
    this.#startStatus();
    return out;
  };

  #flushSubscribers = () => {
    this.#mapSubscribers.forEach(f => {
      const callback = () => f.reduced(this.#previousState, this.#state);
      this.#schedule(callback);
    });
  };

  #sendInnerEvents = () => {
    const sentEvent = this.#machine.__sentEvents.pop();
    if (sentEvent) {
      this.#sendTo(sentEvent.to, sentEvent.event);
    }
  };

  #merge = ({ pContext, context: __context }: ActionResult<Pc, Tc>) => {
    const previousContext = structuredClone(this.#context);

    this.#pContext = merge(this.#pContext, pContext);
    const context = merge(this.#context, __context);
    this.#context = context;
    this.#performStates({ context });

    const check = !equal(previousContext, this.#context);
    this.#flush();
    if (check) this.#flushSubscribers();

    this.#sendInnerEvents();
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

      const delayF = this.toDelay(_delay);
      const check0 = !isDefined(delayF);
      if (check0) return [];
      const interval = this.#executeDelay(delayF);

      const check11 = interval < MIN_ACTIVITY_TIME;
      if (check11) {
        this._addWarning(`Delay (${_delay}) is too short`);
        return [];
      }

      const check12 = interval > MAX_TIME_PROMISE;
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
              const result = this.#performActions(
                this.#contexts,
                activity,
              );
              return this.#merge(result);
            }

            const check5 = this.#performPredicates(
              ...toArray.typed(activity.guards),
            );
            if (check5) {
              const actions = toArray.typed(activity.actions);
              return this.#merge(
                this.#performActions(this.#contexts, ...actions),
              );
            }
          }
        };

        this.#scheduler.schedule(cb);
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

  protected _cachedIntervals: Interval2[] = [];

  get intervalsArePaused() {
    return this._cachedIntervals.every(({ state }) => state === 'paused');
  }

  #performTransition: PerformTransition_F<Pc, Tc> = transition => {
    const check = typeof transition == 'string';
    if (check) return transition;

    const { guards, actions, target } = transition;
    const response = this.#performPredicates(
      ...toArray<GuardConfig>(guards),
    );
    if (response) {
      const result = this.#performActions(
        this.#contexts,
        ...toArray<ActionConfig>(actions),
      );

      return { target, result };
    }
    return false;
  };

  #performTransitions: PerformTransitions_F<Pc, Tc> = (...transitions) => {
    for (const _transition of transitions) {
      const transition = this.#performTransition(_transition);
      const check1 = typeof transition === 'string';
      if (check1) return { target: transition };

      const check2 = transition !== false;
      if (check2) {
        return transition;
      }
    }
    return {};
  };

  #performPromiseSrc: PerformPromise_F<E, P, Pc, Tc> = promise => {
    this._iterate();
    return promise(
      cloneDeep(this.#pContext),
      structuredClone(this.#context),
      structuredClone(this.#event),
    );
  };

  #performFinally = (_finally?: PromiseConfig['finally']) => {
    const check1 = _finally === undefined;
    if (check1) return;

    const finals = toArray.typed(_finally);

    for (const final of finals) {
      const check2 = typeof final === 'string';
      const check3 = isDescriber(final);

      const check4 = check2 || check3;
      if (check4) {
        const result = this.#performActions(this.#contexts, final);
        return result;
      }

      const response = this.#performPredicates(
        ...toArray.typed(final.guards),
      );
      if (response) {
        const result = this.#performActions(
          this.#contexts,
          ...toArray.typed(final.actions),
        );
        return result;
      }
    }
    return;
  };

  get #sending() {
    return this.#status === 'sending';
  }

  #performPromisee: PerformPromisee_F<E, P, Pc, Tc> = (
    from,
    ...promisees
  ) => {
    type PR = PromiseeResult<E, P, Pc, Tc>;

    const promises: TimeoutPromise<PR | undefined>[] = [];

    promisees.forEach(
      ({ src, then, catch: _catch, finally: _finally, max: maxS }) => {
        const promiseF = this.toPromiseSrc(src);
        if (!promiseF) return;

        const handlePromise = (type: 'then' | 'catch', payload: any) => {
          const out = () => {
            const event = {
              type: `${src}::${type}`,
              payload,
            };
            this.#changeEvent(t.any(event));

            const transitions = toArray.typed(
              type === 'then' ? then : _catch,
            );

            const transition = this.#performTransitions(...transitions);
            const target = transition.target;
            const result = merge(
              this.#contexts,
              transition.result,
              this.#performFinally(_finally),
            );

            return { event: this.#event, result, target };
          };

          if (this.#cannotPerform(from)) return;
          return out();
        };

        const _promise = () =>
          this.#performPromiseSrc(promiseF)
            .then(partialCall(handlePromise, 'then'))
            .catch(partialCall(handlePromise, 'catch'));

        const MAX_POMS = [MAX_TIME_PROMISE];

        const check3 = isDefined(maxS);
        if (check3) {
          const delayF = this.toDelay(maxS);
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

  #cannotPerform = (from: string) => {
    const check = this.#sending || !this.#isInsideValue(from);
    return check;
  };

  #performAfter: PerformAfter_F<Pc, Tc> = (from, after) => {
    const entries = Object.entries(after);
    const promises: TimeoutPromise<
      | {
          target: string | undefined;
          result: ActionResult<Pc, Tc>;
        }
      | undefined
    >[] = [];

    entries.forEach(([_delay, transition]) => {
      const delayF = this.toDelay(_delay);
      const check0 = !isDefined(delayF);

      if (check0) return;

      const delay = this.#executeDelay(delayF);

      const check1 = delay > MAX_TIME_PROMISE;
      if (check1) {
        this._addWarning(`Delay ${_delay} is too long`);
        return;
      }

      const transitions = toArray.typed(transition);

      const _promise = async () => {
        await sleep(delay);

        const func = () => {
          const out = this.#performTransitions(...transitions);
          const target = out.target;
          const result = out.result ?? {};

          return { target, result };
        };

        if (this.#cannotPerform(from)) return;

        const out = func();
        const check3 =
          out.target === undefined && Object.keys(out.result).length < 1;
        if (check3) return Promise.reject('No transitions reached !');
        return out;
      };

      const promise = withTimeout(_promise, from);

      promises.push(promise);
    });

    const check5 = promises.length < 1;
    if (check5) return;

    this.#changeEvent(`${from}::${AFTER_EVENT}`);
    const promise = anyPromises(from, ...promises);
    return promise;
  };

  #performAlways: PerformAlway_F<Pc, Tc> = alway => {
    const always = toArray<TransitionConfig>(alway);
    const out = this.#performTransitions(...always);
    const target = out.target;
    if (!target) return;
    const result = merge(this.#contexts, out.result);
    return { target, result };
  };

  get #collectedPromisees() {
    const entriesFlat = Object.entries(this.#flat);
    const entries: [from: string, ...promisees: PromiseConfig[]][] = [];

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

    entriesFlat.forEach(([from, node]) => {
      const activities = node.activities;
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

  #performActivities = () => {
    const collected = this.#collectedActivities;
    const check = collected.length < 1;
    if (check) return;

    const ids: string[] = [];
    for (const args of collected) {
      ids.push(...this.#executeActivities(...args));
    }

    return this._cachedIntervals
      .filter(({ id }) => ids.includes(id))
      .forEach(f => {
        f.start();
      });
  };

  #performChildMachines = () => {
    this.#childrenMachines.forEach(({ id, ...child }) => {
      this.#reduceChild(t.any(child), id);
    });

    this.#childrenServices.forEach(child => {
      child.start();
    });
  };

  get #collecteds0() {
    const entries = new Map<string, Collected0<E, P, Pc, Tc>>();

    this.#collectedAlways.forEach(([from, always]) => {
      entries.set(from, { always: this.#performAlways(always) });
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
   * @deprecated
   * used only for testing
   * returns nothing in prod
   */
  get _collecteds0() {
    if (IS_TEST) {
      return this.#collecteds0;
      /* v8 ignore next 4 */
    }
    console.error('collecteds0 is not available in production');
    return;
  }

  #changeEvent = (event: ToEvents<E, P>) => {
    this.#performStates({ event });
    this.#event = event;
  };

  get #collecteds() {
    const entries = Array.from(this.#collecteds0);
    const out = entries.map(([from, { after, always, promisee }]) => {
      const promise = async () => {
        if (always) {
          this.#changeEvent(`${from}::${ALWAYS_EVENT}`);
          const cb = () => {
            const { diffEntries, diffExits } = this.#diffNext(
              always.target,
            );

            const _exits = this.#performActions(
              this.#contexts,
              ...diffExits,
            );
            this.#merge(_exits);

            this.#merge(always.result);

            const _entries = this.#performActions(
              this.#contexts,
              ...diffEntries,
            );
            this.#merge(_entries);

            this.#performConfig(always.target);
          };
          this.#schedule(cb);
          return;
        }

        const promises: TimeoutPromise<void>[] = [];
        if (after) {
          this.#changeEvent(`${from}::${AFTER_EVENT}`);
          const _after = async () => {
            return after().then(transition => {
              if (transition) {
                const cb = () => {
                  const { diffEntries, diffExits } = this.#diffNext(
                    transition.target,
                  );

                  const _exits = this.#performActions(
                    this.#contexts,
                    ...diffExits,
                  );
                  this.#merge(_exits);

                  this.#merge(transition.result);

                  const _entries = this.#performActions(
                    this.#contexts,
                    ...diffEntries,
                  );
                  this.#merge(_entries);

                  this.#performConfig(transition.target);
                };
                this.#schedule(cb);
              }
            });
          };
          promises.push(withTimeout(_after, 'after'));
        }

        if (promisee) {
          const _promisee = async () => {
            return promisee().then(transition => {
              if (transition) {
                const cb = () => {
                  const { diffEntries, diffExits } = this.#diffNext(
                    transition.target,
                  );

                  const _exits = this.#performActions(
                    this.#contexts,
                    ...diffExits,
                  );
                  this.#merge(_exits);

                  this.#merge(transition.result);

                  const _entries = this.#performActions(
                    this.#contexts,
                    ...diffEntries,
                  );
                  this.#merge(_entries);

                  this.#performConfig(transition.target);
                };
                this.#schedule(cb);
              }
            });
          };
          promises.push(withTimeout(_promisee, 'promisee'));
        }

        const check1 = promises.length < 1;
        if (check1) return;
        await anyPromises(from, ...promises)() /* .catch() */;
      };

      return promise;
    });

    return out;
  }

  #performSelfTransitions = async () => {
    this.#makeBusy();

    const pEvent = this.#event;
    await Promise.all(this.#collecteds.map(f => f()));
    const cEvent = this.#event;
    const check = !equal(pEvent, cEvent);
    if (check) {
      this.#flush();
    }

    this.#makeWork();
  };

  #startInitialEntries = () => {
    const actions = getEntries(this.#initialConfig);
    const cb = () => {
      const result = this.#performActions(this.#contexts, ...actions);

      this.#merge(result);
    };
    this.#schedule(cb);
  };

  pause = () => {
    this.#rinitIntervals();
    this.#mapSubscribers.forEach(f => f.close());
    this.#subscribers.forEach(f => f.close());
    this.#childrenServices.forEach(c => c.pause());
    this.#setStatus('paused');
  };

  resume = () => {
    if (this.#status === 'paused') {
      this.#makeWork();
      this.#performActivities();
      this.#mapSubscribers.forEach(f => f.open());
      this.#subscribers.forEach(f => f.open());
      this.#childrenServices.forEach(c => c.resume());
    }
  };

  stop = () => {
    this.pause();
    this.#mapSubscribers.forEach(f => f.unsubscribe());
    this.#subscribers.forEach(f => f.unsubscribe());
    this.#childrenServices.forEach(c => c.stop());
    this.#timeoutActions.forEach(clearTimeout);
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
   * Uses internal
   */
  _providePrivateContext = (pContext: Pc) => {
    this.#initialPpc = pContext;
    this.#pContext = pContext;
    this.#makeBusy();

    this.#machine.addPrivateContext(this.#initialPpc);

    this.#startingStatus();
    return this.#machine;
  };

  /**
   * @deprecated
   * Uses internally
   */
  _ppC = this._providePrivateContext;

  /**
   * @deprecated
   * Used internally
   */
  _provideContext = (context: Tc) => {
    this.#initialContext = context;
    this.#context = context;
    this.#performStates({ context });
    this.#makeBusy();

    this.#machine.addContext(this.#initialContext);

    this.#startingStatus();
    return this.#machine;
  };

  get addOptions() {
    return this.#machine.addOptions;
  }

  #mapSubscribers = new Set<SubscriberMapClass<E, P, Tc>>();

  subscribe = (
    sub: (state: State<Tc>) => void,
    options?: SubscriberOptions<Tc>,
  ) => {
    const find = Array.from(this.#subscribers).find(
      f => f.id === options?.id,
    );
    if (find) return find;
    const _sub = createSubscriber(sub, options);
    this.#subscribers.add(_sub);
    return _sub;
  };

  get snapshot() {
    const out: State<Tc> = {
      status: this.#status,
      value: this.#value,
      context: this.#context,
      tags: this.#config.tags,
      event: this.#event,
    };

    return Object.freeze(cloneDeep(out));
  }

  subscribeMap: AddSubscriber_F<E, P, Tc> = (_subscriber, options) => {
    const eventsMap = this.#machine.eventsMap;
    const promiseesMap = this.#machine.promiseesMap;
    const find = Array.from(this.#mapSubscribers).find(
      f => f.id === options?.id,
    );
    if (find) return find;

    const subcriber = createSubscriberMap(
      eventsMap,
      promiseesMap,
      _subscriber,
      options,
    );
    this.#mapSubscribers.add(subcriber);
    return subcriber;
  };

  #errorsCollector = new Set<string>();
  #warningsCollector = new Set<string>();

  /**
   * @deprecated
   * Just use for testing
   * returns nothing in prod
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
   * returns nothing in prod
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

  protected _send: _Send_F<E, P, Pc, Tc> = event => {
    this.#changeEvent(event);
    this.#setStatus('sending');
    let result = this.#contexts;
    let sv = this.#value;
    const entriesFlat = Object.entries(this.#flat);
    const flat: [from: string, transitions: TransitionConfig[]][] = [];
    const targets: string[] = [];

    entriesFlat.forEach(([from, node]) => {
      const on = node.on;
      const type = event.type;
      const trs = on?.[type];
      if (trs) {
        const transitions = toArray.typed(trs);
        flat.push([from, transitions]);
      }
    });

    flat.forEach(([, transitions]) => {
      const { target, result: _result } = this.#performTransitions(
        ...toArray.typed(transitions),
      );

      const check2 = target !== undefined;

      if (check2) {
        targets.push(target);
      }

      result = merge(result, _result);
    });

    // #region Use targets to perform entry and exit actions
    targets.forEach(target => {
      const { diffEntries, diffExits } = this.#diffNext(target);

      sv = nextSV(sv, target);
      result = merge(
        result,
        this.#performActions(result, ...diffExits),
        this.#performActions(result, ...diffEntries),
      );
    });
    // #endregion

    //If no changes in state value, no cahnges in current config
    const next = switchV({
      condition: equal(this.#value, sv),
      truthy: undefined,
      falsy: initialConfig(this.#machine.valueToConfig(sv)),
    });

    return { next, result };
  };

  get #possibleEvents() {
    return possibleEvents(this.#flat);
  }

  #cannotEvent = (_event: EventArg<E>) => {
    const type = eventToType(_event);
    const check = !this.#possibleEvents.includes(type);
    return check;
  };

  sender = <T extends EventArgT<E>>(type: T) => {
    type Arg = Extract<ToEventsR<E, P>, { type: T }>['payload'];
    type Payload = object extends Arg ? [] : [Arg];

    return (...data: Payload) => {
      const payload = data.length === 1 ? data[0] : {};
      const event = { type, payload } as EventArg<E>;
      return this.send(event);
    };
  };

  send = (_event: EventArg<E>) => {
    const check = this.#cannotEvent(_event);
    if (check) return;
    const event = transformEventArg(_event);
    const { result, next } = this._send(event);
    this.#merge(result);

    if (isDefined(next)) {
      this.#config = next;
      this.#performConfig(true);
      this.#makeWork();
      this._next();
    } else this.#makeWork();
  };

  #proposedNextSV = (target: string) => nextSV(this.#value, target);

  protected proposedNextConfig = (target: string) => {
    const nextValue = this.#proposedNextSV(target);
    const out = this.#machine.valueToConfig(nextValue);

    return out;
  };

  #diffNext = (target?: string) => {
    if (!target) {
      return { sv: this.#value, diffEntries: [], diffExits: [] };
    }

    const next = t.unknown<NodeConfig>(this.proposedNextConfig(target));
    const flatNext = flatMap(next, false);

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
        const out2 = this.#machine.retrieveParentFromInitial(key);
        diffEntries.push(...getEntries(out2));
      }
    });
    // #endregion

    // #region Exit actions

    // These actions are from previous config states that are not inside the next
    entriesCurrent.forEach(([key, node]) => {
      const check2 = !keysNext.includes(key);

      if (check2) {
        diffExits.push(...getExits(node));
      }
    });
    // #endregion
    const sv = this.#proposedNextSV(target);
    return { sv, diffEntries, diffExits };
  };

  #isInsideValue = (_state: string) => {
    const values = decomposeSV(this.#value);
    const entry = _state.substring(1);
    const state = replaceAll({
      entry,
      match: DEFAULT_DELIMITER,
      replacement: '.',
    });

    return values.includes(state);
  };

  #makeWork = () => this.#setStatus('working');

  // #endregion

  #returnWithWarning = <T = any>(
    out: T | undefined,
    ...messages: string[]
  ) => {
    const check = isDefined(out);
    if (check) return out;

    this._addWarning(...messages);
    return;
  };

  toAction = (action: ActionConfig) => {
    const events = this.#machine.eventsMap;
    const promisees = this.#machine.promiseesMap;
    const actions = this.#machine.actions;

    return this.#returnWithWarning(
      toAction<E, P, Pc, Tc>(events, promisees, action, actions),
      `Action (${reduceAction(action)}) is not defined`,
    );
  };

  toPredicate = (guard: GuardConfig) => {
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

  toPromiseSrc = (src: string) => {
    const events = this.#machine.eventsMap;
    const promisees = this.#machine.promiseesMap;
    const promises = this.#machine.promises;

    return this.#returnWithWarning(
      toPromiseSrc<E, P, Pc, Tc>(events, promisees, src, promises),
      `Promise (${src}) is not defined`,
    );
  };

  toDelay = (delay: string) => {
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

  /**
   * Subscribes a child machine to the current machine.
   *
   * @template T - The type of the child machine, extending from AnyMachine.
   * @param  id - The unique identifier for the child machine.
   * @param  child - The child machine to be subscribed.
   * @returns The result of the child machine subscription.
   *
   */
  subscribeM = <T extends AnyMachine = AnyMachine>(
    id: string,
    { initials: _initials, ...rest }: ChildS2<E, P, Pc, Tc, T>,
  ) => {
    const context = this.#context;
    const pContext = this.#pContext;
    const event = this.#event;
    const reduced = reduceFnMap(
      this.#machine.eventsMap,
      this.#machine.promiseesMap,
      _initials,
    );

    const initials = reduced(pContext, context, event);

    const child = typings.cast<ChildS<E, P, Pc, T>>({
      initials,
      ...rest,
    });

    return this.#reduceChild(child, id);
  };

  /**
   * @deprecated
   * Used internally
   */
  #sendTo = <T extends EventObject>(to: string, event: T) => {
    const service = this.#childrenServices.find(({ id }) => id === to);

    if (service) service.send(typings.anify(event));
  };

  #reduceChild = <T extends AnyMachine = AnyMachine>(
    { subscribers, machine, initials }: ChildS<E, P, Pc, T>,
    id: string,
  ) => {
    let service = typings.forceCast<InterpreterFrom<T>>(
      this.#childrenServices.find(f => f.id === id),
    );

    if (!service) {
      service = this.interpretChild(machine, initials);
      service.id = id;
      this.#childrenServices.push(typings.forceCast(service));
    }

    const subscriber = service.subscribeMap(
      ({ event: { type } }) => {
        const _subscribers = toArray.typed(subscribers);

        _subscribers.forEach(({ contexts, events }) => {
          const type2 = eventToType(service.event);

          const checkEvents = reduceEvents(t.any(events), type, type2);

          const checkContexts = !isDefined(contexts);
          if (checkEvents) {
            if (checkContexts) {
              const pContext = t.any(service.#context);
              const callback = () => this.#merge({ pContext });
              this.#scheduler.schedule(callback);
            } else {
              type _Contexts = SingleOrArray<
                string | Record<string, string | string[]>
              >;
              const _contexts = t.unknown<_Contexts>(contexts);
              const paths = toArray.typed(_contexts);

              paths.forEach(path => {
                if (typeof path === 'string') {
                  const callback = () =>
                    assignByKey(this.#pContext, path, service.#context);
                  this.#scheduler.schedule(callback);
                } else {
                  const entries = Object.entries(path).map(
                    ([key, value]) => {
                      const paths = toArray.typed(value);
                      return t.tuple(key, paths);
                    },
                  );

                  entries.forEach(([pathChild, paths]) => {
                    paths.forEach(path => {
                      const pContext = mergeByKey(this.#pContext)(
                        path,
                        getByKey(service.#context, pathChild),
                      );

                      const callback = () => this.#merge({ pContext });
                      this.#scheduler.schedule(callback);
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

  [Symbol.dispose] = () => {
    this.stop();
    this.#scheduler.stop();
  };

  [Symbol.asyncDispose] = () => {
    const out = asyncfy(this[Symbol.dispose]);
    return out();
  };
}

export const TIME_TO_RINIT_SELF_COUNTER = MIN_ACTIVITY_TIME * 2;

export type AnyInterpreter2 = Interpreter<any, any, any, any, any, any>;

export type InterpreterFrom<M extends AnyMachine> = Interpreter<
  ConfigFrom<M>,
  PrivateContextFrom<M>,
  ContextFrom<M>,
  EventsMapFrom<M>,
  PromiseesMapFrom<M>,
  MachineOptionsFrom<M>
>;

export const interpret: Interpreter_F = (
  machine,
  { context, pContext, mode, exact },
) => {
  //@ts-expect-error for build
  const out = new Interpreter(machine, mode, exact);

  out._ppC(pContext);
  out._provideContext(context);

  return out as any;
};
