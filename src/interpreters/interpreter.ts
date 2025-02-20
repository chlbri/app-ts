import { isDefined, partialCall } from '@bemedev/basifun';
import type { SingleOrArray } from '@bemedev/boolean-recursive';
import { decomposeSV } from '@bemedev/decompose';
import { createInterval, type Interval2 } from '@bemedev/interval2';
import sleep from '@bemedev/sleep';
import { t, type Fn } from '@bemedev/types';
import cloneDeep from 'clone-deep';
import equal from 'fast-deep-equal';
import {
  reduceAction,
  toAction,
  type Action,
  type ActionConfig,
  type ActionResult,
} from '~actions';
import {
  CATCH_EVENT_TYPE,
  DEFAULT_DELIMITER,
  MAX_SELF_TRANSITIONS,
  MAX_TIME_PROMISE,
  MIN_ACTIVITY_TIME,
  THEN_EVENT_TYPE,
} from '~constants';
import { toDelay, type Delay } from '~delays';
import {
  INIT_EVENT,
  transformEventArg,
  type EventArg,
  type EventsMap,
  type ToEvents,
} from '~events';
import { toPredicate, type GuardConfig, type PredicateS } from '~guards';
import { getEntries, getExits, type Machine } from '~machine';
import {
  getByKey,
  mergeByKey,
  reduceEvents,
  toMachine,
  type AnyMachine,
  type Child,
  type ChildS,
  type Config,
  type ConfigFrom,
  type ContextFrom,
  type EventsMapFrom,
  type GetEventsFromConfig,
  type MachineOptions,
  type MachineOptionsFrom,
  type PrivateContextFrom,
  type SimpleMachineOptions2,
} from '~machines';
import {
  PromiseConfig,
  PromiseFunction,
  racePromises,
  toPromiseSrc,
  withTimeout,
  type PromiseeResult,
  type TimeoutPromise,
} from '~promises';
import {
  flatMap,
  initialNode,
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
import {
  isDescriber,
  type Keys,
  type PrimitiveObject,
  type RecordS,
} from '~types';
import {
  IS_TEST,
  measureExecutionTime,
  replaceAll,
  toArray,
} from '~utils';
import { merge } from './../utils/merge';
import { performRemaining, possibleEvents } from './interpreter.helpers';
import type {
  _Send_F,
  AddSubscriber_F,
  AnyInterpreter,
  CreateInterval2_F,
  ExecuteActivities_F,
  Interpreter_F,
  Mode,
  PerformAction_F,
  PerformAfter_F,
  PerformAlway_F,
  PerformDelay_F,
  PerformPredicate_F,
  PerformPromise_F,
  PerformPromisees_F,
  PerformTransition_F,
  PerformTransitions_F,
  Remaininigs,
  Selector_F,
  WorkingStatus,
} from './interpreter.types';
import { Scheduler } from './scheduler';
import { createSubscriber, type Subscriber } from './subscriber';

export class Interpreter<
  const C extends Config = Config,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  E extends EventsMap = GetEventsFromConfig<C>,
  Mo extends SimpleMachineOptions2 = MachineOptions<C, E, Pc, Tc>,
> implements AnyInterpreter<E, Pc, Tc>
{
  #machine: Machine<C, Pc, Tc, E, Mo>;
  #status: WorkingStatus = 'idle';
  #config: NodeConfigWithInitials;
  #flat!: RecordS<NodeConfigWithInitials>;
  #possibleEvents!: string[];
  #value!: StateValue;
  #mode: Mode;
  readonly #initialNode: Node<E, Pc, Tc>;
  #node!: Node<E, Pc, Tc>;
  #iterator = 0;
  #event: ToEvents<E> = INIT_EVENT;
  readonly #initialConfig: NodeConfigWithInitials;
  #initialPpc!: Pc;
  #initialContext!: Tc;
  #pContext!: Pc;
  #context!: Tc;
  #scheduler: Scheduler;

  #childrenServices: AnyInterpreter<E, Pc, Tc>[] = [];
  get #childrenMachines() {
    const _machines = toArray.typed(this.#machine.preConfig.machines);
    return _machines.map(this.toMachine).filter(isDefined);
  }

  id?: string;

  /**
   * @deprecated
   * Just use for typing
   */
  get mo() {
    return this.#machine.mo;
  }

  get mode() {
    return this.#mode;
  }

  get #idle() {
    return this.#status === 'idle';
  }

  get #canAct() {
    return this.#status === 'started';
  }

  get event() {
    return this.#event;
  }

  get eventsMap() {
    return this.#machine.eventsMap;
  }

  constructor(machine: Machine<C, Pc, Tc, E, Mo>, mode: Mode = 'strict') {
    this.#machine = machine.renew;

    this.#initialConfig = this.#machine.initialConfig;
    this.#initialNode = this.#resolveNode(this.#initialConfig);
    this.#mode = mode;
    this.#config = this.#initialConfig;

    this.#performConfig();
    this.#scheduler = new Scheduler();

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
      const check2 = this.#warningsCollector.size > 0;
      if (check2) {
        const warnings = this.#displayConsole(this.#warningsCollector);
        console.log(warnings);
      }

      const check1 = this.#errorsCollector.size > 0;
      if (check1) {
        const errors = this.#displayConsole(this.#errorsCollector);
        throw new Error(errors);
      }

      return;
    }

    if (this.isNormal) {
      const check1 = this.#errorsCollector.size > 0;
      if (check1) {
        const errors = this.#displayConsole(this.#errorsCollector);
        console.error(errors);
      }

      const check2 = this.#warningsCollector.size > 0;
      if (check2) {
        const warnings = this.#displayConsole(this.#warningsCollector);
        console.log(warnings);
      }

      return;
    }

    if (this.isStrictest) {
      const errors = this.#displayConsole([
        ...this.#errorsCollector,
        ...this.#warningsCollector,
      ]);

      throw new Error(errors);
    }
  };

  #performConfig = () => {
    this.#value = nodeToValue(this.#config);
    this.#node = this.#resolveNode(this.#config);

    const configForFlat = t.unknown<NodeConfig>(this.#config);
    this.#flat = t.any(flatMap(configForFlat));
    this.#possibleEvents = possibleEvents(this.#flat);
  };

  protected iterate = () => this.#iterator++;

  #resolveNode = (config: NodeConfigWithInitials) => {
    const options = this.#machine.options;
    const events = this.#machine.eventsMap;

    return resolveNode<E, Pc, Tc>(events, config, options);
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
    out.ppC(this.#initialPpc);
    out.provideContext(this.#initialContext);

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
   * Call in production will return nothing
   */
  get pContext() {
    if (IS_TEST) return this.#pContext;
    console.error('pContext is not available in production');
    return;
  }

  select: Selector_F<Tc> = selector => getByKey(this.#context, selector);

  /**
   * @deprecated
   * Just use for testing
   * Call in production will return nothing
   */
  pSelect: Selector_F<Pc> = selector => {
    const pContext = this.pContext;
    if (pContext) return getByKey(pContext, selector);
    return;
  };

  #startStatus = (): WorkingStatus => (this.#status = 'started');

  #displayConsole = (messages: Iterable<string>) => {
    return Array.from(messages).join('\n');
  };

  #checkContexts = () => {
    if (!this.#pContext) {
      this._addError('No pContext provided');
    }
    if (!this.#context) {
      this._addError('No context provided');
    }
  };

  start = async () => {
    this.#checkContexts();
    this.#throwing();

    this.#startStatus();
    this.#scheduler.initialize(this.#startInitialEntries);
    this.#performMachines();
    await this.next();
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

  #produceSubscriberCallback = (subscriber: Subscriber<E, Tc>) => {
    const context = cloneDeep(this.#context);
    const event = structuredClone(this.#event);
    const callback = () => subscriber.reduced(context, event);
    return callback;
  };

  #scheduleSubscriber = (subscriber: Subscriber<E, Tc>) => {
    const callback = this.#produceSubscriberCallback(subscriber);
    this.#schedule(callback);
  };

  flushSubscribers = () => {
    this.#subscribers.forEach(this.#scheduleSubscriber);
  };

  #selfTransitionsCounter = 0;

  protected next = async () => {
    const previousValue = this.#value;
    const checkCounter =
      this.#selfTransitionsCounter >= MAX_SELF_TRANSITIONS;

    if (checkCounter) {
      this._addError(
        'Too much self transitions, exceeded 100 transitions',
      );
    }

    this.#throwing();

    this.flushSubscribers();
    this.#rinitIntervals();
    this.#performActivities();
    await this.#performSelfTransitions();

    this.#selfTransitionsCounter++;

    const currentConfig = this.#value;
    const check = !equal(previousValue, currentConfig);

    if (check) {
      const duration = await measureExecutionTime(this.next.bind(this));
      const check2 = duration > MIN_ACTIVITY_TIME;
      if (check2) this.#selfTransitionsCounter = 0;
    } else this.#selfTransitionsCounter = 0;
  };

  #performAction: PerformAction_F<E, Pc, Tc> = action => {
    return action(
      cloneDeep(this.#pContext),
      structuredClone(this.#context),
      structuredClone(this.#event),
    );
  };

  #executeAction: PerformAction_F<E, Pc, Tc> = action => {
    this.#makeBusy();
    const { pContext, context } = this.#performAction(action);

    this.#makeWork();
    return { pContext, context };
  };

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
      .map(value => this.#executeAction(value))
      .reduce((acc, value) => {
        const out = merge(acc, value);
        return out;
      }, contexts);
  };

  #performPredicate: PerformPredicate_F<E, Pc, Tc> = predicate => {
    return predicate(
      cloneDeep(this.#pContext),
      structuredClone(this.#context),
      structuredClone(this.#event),
    );
  };

  #executePredicate: PerformPredicate_F<E, Pc, Tc> = predicate => {
    this.#makeBusy();
    const out = this.#performPredicate(predicate);

    this.#status = 'working';
    return out;
  };

  #performGuards = (...guards: GuardConfig[]) => {
    if (guards.length < 1) return true;
    return guards
      .map(this.toPredicate)
      .filter(isDefined)
      .map(this.#executePredicate)
      .every(bool => bool);
  };

  #performDelay: PerformDelay_F<E, Pc, Tc> = delay => {
    return delay(
      cloneDeep(this.#pContext),
      structuredClone(this.#context),
      structuredClone(this.#event),
    );
  };

  #executeDelay: PerformDelay_F<E, Pc, Tc> = delay => {
    this.#makeBusy();
    const out = this.#performDelay(delay);

    this.#status = 'started';
    return out;
  };

  #merge = ({ pContext, context }: ActionResult<Pc, Tc>) => {
    this.#pContext = merge(this.#pContext, pContext);
    this.#context = merge(this.#context, context);

    this.#fullSubscribers.forEach(f => {
      const callback = () => f.reduced(this.#context, this.#event);
      this.#schedule(callback);
    });
  };

  #executeActivities: ExecuteActivities_F = (from, _activities) => {
    const entries = Object.entries(_activities);
    const outs: string[] = [];

    for (const [_delay, _activity] of entries) {
      const delayF = this.toDelay(_delay);
      const check0 = !isDefined(delayF);
      if (check0) return [];
      const delay = this.#executeDelay(delayF);

      const check1 = delay < MIN_ACTIVITY_TIME;
      if (check1) {
        this._addWarning(`${_delay} is too short`);
        return [];
      }

      const check11 = delay > MAX_TIME_PROMISE;
      if (check11) {
        this._addWarning(`${_delay} is too long`);
        return [];
      }

      const check2 = this.#sending || !this.#isInsideValue(from);
      if (check2) {
        return [];
      }

      const id = `${from}::${_delay}`;
      const _interval = this._cachedIntervals.find(f => f.id === id);

      if (_interval) {
        outs.push(id);
        continue;
      }

      const activities = toArray.typed(_activity);

      const interval = delay;
      const callback = () => {
        const cb = () => {
          for (const activity of activities) {
            const check2 = typeof activity === 'string';
            const check3 =
              typeof activity === 'object' && 'name' in activity;

            const check4 = check2 || check3;

            if (check4) {
              return this.#merge(
                this.#performActions(this.#contexts, activity),
              );
            }

            const check5 = this.#performGuards(
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

  protected createInterval: CreateInterval2_F = ({
    callback,
    id,
    interval,
  }) => {
    const out = createInterval({
      callback,
      id,
      interval,
      exact: false,
    });

    return out;
  };

  protected _cachedIntervals: Interval2[] = [];

  #performTransition: PerformTransition_F<Pc, Tc> = transition => {
    const check = typeof transition == 'string';
    if (check) return transition;

    const { guards, actions, target } = transition;
    const response = this.#performGuards(...toArray<GuardConfig>(guards));
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

      const check2 = typeof transition === 'object';
      if (check2) {
        return transition;
      }
    }
    return {};
  };

  #performPromiseSrc: PerformPromise_F<E, Pc, Tc> = promise => {
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

      const response = this.#performGuards(...toArray.typed(final.guards));
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

  #remaining: RecordS<
    () => {
      target?: string;
      result: ActionResult<Pc, Tc>;
    }
  > = {};

  #produceKeyRemainPromise = (from: string) => `${from}::promise`;

  #addRemainingPromise = (
    state: string,
    remain: () => {
      target?: string;
      result: ActionResult<Pc, Tc>;
    },
  ) => {
    const key = this.#produceKeyRemainPromise(state);
    this.#remaining[key] = remain;
  };

  #produceKeyRemainAfter = (from: string) => `${from}::after`;

  #addRemainingAfter = (
    state: string,
    remain: () => {
      target?: string;
      result: ActionResult<Pc, Tc>;
    },
  ) => {
    const key = this.#produceKeyRemainAfter(state);
    this.#remaining[key] = remain;
  };

  #performPromisees0: PerformPromisees_F<E, Pc, Tc> = (
    from,
    ...promisees
  ) => {
    type PR = PromiseeResult<E, Pc, Tc>;

    // #region Checker for reentering
    const key = this.#produceKeyRemainPromise(from);
    const remain = this.#remaining[key];
    const check = remain !== undefined;
    if (check) return undefined;
    // #endregion

    const promises: TimeoutPromise<PR | undefined>[] = [];
    const remains: Remaininigs<Pc, Tc> = [];

    promisees.forEach(
      ({ src, then, catch: _catch, finally: _finally, max: maxS }) => {
        const promiseF = this.toPromiseSrc(src);
        if (!promiseF) return;

        const handlePromise = (type: 'then' | 'catch', payload: any) => {
          const out = () => {
            this.#event = {
              type: type === 'then' ? THEN_EVENT_TYPE : CATCH_EVENT_TYPE,
              payload,
            };

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

          const check = this.#sending || !this.#isInsideValue(from);
          if (check) {
            const remain = () => {
              const { result, target } = out();
              return { result, target };
            };

            remains.push(remain);
            return;
          }
          return out();
        };

        const _promise = () =>
          this.#performPromiseSrc(promiseF)
            .then(partialCall(handlePromise, 'then'))
            .catch(partialCall(handlePromise, 'catch'));

        const MAX_POMS = [MAX_TIME_PROMISE];

        const check = isDefined(maxS);
        let max: number;
        if (check) {
          const delayF = this.toDelay(maxS);
          const check6 = !isDefined(delayF);
          if (check6) return undefined;
          max = this.#performDelay(delayF);
          MAX_POMS.push(max);
        }

        const promise = withTimeout(_promise, key, ...MAX_POMS);
        promises.push(promise);
      },
    );

    const finalize = () => {
      const remaining = performRemaining(...remains);
      this.#addRemainingPromise(from, remaining);
    };

    const promise = racePromises(key, ...promises);

    return { promise, finalize };
  };

  get possibleEvents() {
    return this.#possibleEvents;
  }

  canEvent = (eventS: string) => {
    return this.#possibleEvents.includes(eventS);
  };

  #performAfter: PerformAfter_F<Pc, Tc> = (from, after) => {
    // #region Checker for reentering
    const key = this.#produceKeyRemainAfter(from);
    const remain = this.#remaining[key];
    const check = remain !== undefined;
    if (check) {
      return undefined;
    }
    // #endregion

    const entries = Object.entries(after);
    const promises: TimeoutPromise<
      | {
          target: string | undefined;
          result: ActionResult<Pc, Tc>;
        }
      | undefined
    >[] = [];
    const remains: Remaininigs<Pc, Tc> = [];

    entries.forEach(([_delay, transition]) => {
      const delayF = this.toDelay(_delay);
      const check0 = !isDefined(delayF);
      if (check0) return;

      const delay = this.#executeDelay(delayF);

      const check1 = delay < MAX_TIME_PROMISE;
      if (check1) {
        this._addWarning(`${_delay} is too long`);
        return;
      }

      const transitions = toArray.typed(transition);

      const _promise = () =>
        sleep(delay).then(() => {
          const remain = () => {
            const out = this.#performTransitions(...transitions);
            const target = out.target;
            const result = out.result ?? {};

            return { target, result };
          };

          const check2 = this.#sending || !this.#isInsideValue(from);
          if (check2) {
            remains.push(remain);
            return;
          }

          return remain();
        });

      const promise = withTimeout(_promise, key);

      promises.push(promise);
    });

    const remaining = performRemaining(...remains);

    const finalize = () => {
      this.#addRemainingAfter(from, remaining);
    };

    const out = { promise: racePromises(key, ...promises), finalize };

    return out;
  };

  #performAlway: PerformAlway_F<Pc, Tc> = (from, alway) => {
    const check1 = this.#sending || !this.#isInsideValue(from);
    if (check1) return;

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

  get #_performPromisees() {
    return this.#collectedPromisees.map(args => {
      const out = this.#performPromisees0(...args);
      return out;
    });
  }

  get #_performAlways() {
    const collected = this.#collectedAlways;
    const check = collected.length < 1;
    if (check) return;
    return this.#collectedAlways
      .map(args => {
        const out = this.#performAlway(...args);
        return out;
      })
      .reduce((acc, value) => merge(acc, value));
  }

  #performActivities = () => {
    const collected = this.#collectedActivities;
    const check = collected.length < 1;
    if (check) return;

    const ids: string[] = [];
    for (const args of this.#collectedActivities) {
      ids.push(...this.#executeActivities(...args));
    }

    return this._cachedIntervals
      .filter(({ id }) => ids.includes(id))
      .forEach(f => {
        this.#scheduler.schedule(f.start.bind(f));
      });
  };

  #performAfters = (
    ..._afters: [from: string, after: DelayedTransitions][]
  ) => {
    type Promises = TimeoutPromise<
      | {
          target?: string;
          result: ActionResult<Pc, Tc>;
        }
      | undefined
    >[];

    const out = async () => {
      const finalizes: (() => void)[] = [];
      const promises: Promises = [];

      const afters = _afters
        .map(args => this.#performAfter(...args))
        .filter(isDefined);

      const check1 = afters.length < 1;
      if (check1) return;

      afters.forEach(({ finalize, promise }) => {
        finalizes.push(finalize);
        promises.push(promise);
      });

      const finalize = () => {
        finalizes.forEach(f => f());
      };

      const _resultAfters = await Promise.all(
        promises.map(p => p()),
      ).finally(finalize);
      const resultAfters = _resultAfters.filter(isDefined);

      const cb = () => {
        resultAfters.forEach(({ result, target }) => {
          this.#merge(result);

          if (target) {
            this.#config = this.proposedNextConfig(target);
            this.#performConfig();
          }
        });
      };

      this.#scheduler.schedule(cb);
    };

    return out;
  };

  #performAlways = () => {
    const resultAlways = this.#_performAlways;

    if (resultAlways) {
      const callback = () => {
        this.#makeBusy();

        const { target, result } = resultAlways;
        this.#merge(result);

        if (target) {
          this.#config = this.proposedNextConfig(target);
          this.#performConfig();
        }

        this.#makeWork();
      };

      this.#scheduler.schedule(callback);
    }
  };

  #performPromisees = async () => {
    const values = this.#_performPromisees.filter(
      val => val !== undefined,
    );

    const finalize = () => values.forEach(({ finalize }) => finalize());

    const toPromises = values
      .map(({ promise }) => promise)
      .filter(isDefined);

    const check1 = toPromises.length < 1;

    if (check1) return this.#scheduler.schedule(finalize);

    const promises = await Promise.all(toPromises.map(p => p())).finally(
      finalize,
    );

    const cb = () => {
      let target = t.union(t.string, t.undefined);

      promises.forEach(value => {
        if (value) {
          this.#merge(value.result);

          this.#event = value.event;
          target = value.target;
        }
      });

      if (target) {
        this.#config = this.proposedNextConfig(target);
        this.#performConfig();
      }
    };

    this.#scheduler.schedule(cb);
  };

  #performMachines = () => {
    this.#childrenMachines.forEach(child => {
      this.#reduceChild(t.any(child));
    });

    this.#childrenServices.forEach(child => {
      child.start();
    });
  };

  #performSelfTransitions = async () => {
    this.#status = 'busy';
    const promises: (() => Promise<void>)[] = [];

    const check0 = this.#collectedPromisees.length > 0;
    if (check0) {
      promises.push(this.#performPromisees);
    }

    const check1 = this.#collectedAfters.length > 0;
    if (check1) {
      promises.push(this.#performAfters(...this.#collectedAfters));
    }

    this.#performAlways();

    const check2 = promises.length > 0;

    if (check2) {
      await Promise.all(promises.map(p => p()));
    }
    this.#makeWork();
  };

  #startInitialEntries = () => {
    const actions = getEntries(this.#initialConfig);
    return this.#performActions(this.#contexts, ...actions);
  };

  pause = () => {
    this.#rinitIntervals();
    this.#fullSubscribers.forEach(f => {
      f.close();
    });
    this.#childrenServices.forEach(child => {
      child.pause();
    });
    this.#status = 'paused';
  };

  resume = () => {
    if (this.#status === 'paused') {
      this.#status = 'working';
      this.#performActivities();
      this.#fullSubscribers.forEach(f => {
        f.open();
      });
      this.#childrenServices.forEach(child => {
        child.resume();
      });
    }
  };

  stop = () => {
    this.#status = 'stopped';
    this.#rinitIntervals();
  };

  #makeBusy = (): WorkingStatus => (this.#status = 'busy');

  providePrivateContext = (pContext: Pc) => {
    this.#initialPpc = pContext;
    this.#pContext = pContext;
    this.#makeBusy();

    if (this.#idle) this.#machine.addPrivateContext(this.#initialPpc);

    this.#status = 'starting';
    return this.#machine;
  };

  ppC = this.providePrivateContext;

  provideContext = (context: Tc) => {
    this.#initialContext = context;
    this.#context = context;
    this.#makeBusy();

    if (this.#idle) this.#machine.addContext(this.#initialContext);

    this.#status = 'starting';
    return this.#machine;
  };

  // #region Providers

  addAction = (key: Keys<Mo['actions']>, action: Action<E, Pc, Tc>) => {
    if (this.#canAct) {
      const out = { [key]: action };
      this.#machine.addActions(out);
    }
  };

  addGuard = (
    key: Keys<Mo['predicates']>,
    guard: PredicateS<E, Pc, Tc>,
  ) => {
    if (this.#canAct) {
      const out = { [key]: guard };
      this.#machine.addPredicates(out);
    }
  };

  addPromise = (
    key: Keys<Mo['promises']>,
    promise: PromiseFunction<E, Pc, Tc>,
  ) => {
    if (this.#canAct) {
      const out = { [key]: promise };
      this.#machine.addPromises(out);
    }
  };

  addDelay = (key: Keys<Mo['delays']>, delay: Delay<E, Pc, Tc>) => {
    if (this.#canAct) {
      const out = { [key]: delay };
      this.#machine.addDelays(out);
    }
  };

  addMachine = (key: Keys<Mo['machines']>, machine: Child<E, Tc>) => {
    if (this.#canAct) {
      const out = { [key]: machine };
      this.#machine.addMachines(out);
    }
  };

  #subscribers = new Set<Subscriber<E, Tc>>();
  #fullSubscribers = new Set<Subscriber<E, Tc>>();

  addSubscriber: AddSubscriber_F<E, Tc> = _subscriber => {
    const eventsMap = this.#machine.eventsMap;

    const subcriber = createSubscriber(eventsMap, _subscriber);
    this.#subscribers.add(subcriber);
    return subcriber;
  };

  addFullSubscriber: AddSubscriber_F<E, Tc> = _subscriber => {
    const eventsMap = this.#machine.eventsMap;

    const subcriber = createSubscriber(eventsMap, _subscriber);
    this.#fullSubscribers.add(subcriber);
    return subcriber;
  };
  // #endregion

  #errorsCollector = new Set<string>();
  #warningsCollector = new Set<string>();

  get errorsCollector() {
    return this.#errorsCollector;
  }

  get warningsCollector() {
    return this.#warningsCollector;
  }

  protected _addError = (...errors: string[]) => {
    errors.forEach(error => this.#errorsCollector.add(error));
  };

  protected _addWarning = (...warnings: string[]) => {
    warnings.forEach(warning => this.#warningsCollector.add(warning));
  };

  // #region Next

  protected _send: _Send_F<E, Pc, Tc> = (
    event: Exclude<ToEvents<E>, string>,
  ) => {
    type PR = PromiseeResult<E, Pc, Tc>;

    let result: PR['result'] = this.#contexts;
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

    flat.forEach(([from, transitions]) => {
      const check1 = !this.#isInsideValue(from);
      if (check1) return;

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

    const check4 = equal(this.#value, sv); //If no changes in state value
    const next = check4
      ? this.#config
      : initialNode(this.#machine.valueToConfig(sv));
    return { result, next };
  };

  send = async (_event: EventArg<E>) => {
    const event = transformEventArg(_event);
    const previous = structuredClone(this.#event);
    this.#event = event;

    this.#status = 'sending';
    const check0 = typeof event === 'string';
    if (check0) {
      this.#makeWork();
      return;
    }
    const sends = this._send(event);
    const check1 = sends === undefined;

    if (check1) {
      this.#event = previous;
      this.#makeWork();

      return;
    }

    const { result, next } = sends;
    this.#merge(result);
    const check2 = !equal(this.#config, next);

    if (check2) {
      this.#config = next;
      this.#makeWork();
      this.#performConfig();
      await this.next();
    }
  };

  #proposedNextSV = (target: string) => nextSV(this.#value, target);

  protected proposedNextConfig = (target: string) => {
    const nextValue = this.#proposedNextSV(target);
    const out = this.#machine.valueToConfig(nextValue);

    return out;
  };

  #diffNext = (target: string) => {
    const next = t.unknown<NodeConfig>(this.proposedNextConfig(target));
    const flatNext = flatMap(next, false);

    const entriesCurrent = Object.entries(this.#flat);
    const keysNext = Object.keys(flatNext);

    const keys = entriesCurrent.map(([key]) => key);
    const diffEntries: string[] = [];
    const diffExits: string[] = [];

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
    const check1 = _state === '/';
    if (check1) return true;

    const values = decomposeSV(this.#value);
    const entry = _state.substring(1);
    const state = replaceAll({
      entry,
      match: DEFAULT_DELIMITER,
      replacement: '.',
    });

    return values.includes(state);
  };

  #makeWork = () => (this.#status = 'working');

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
    const actions = this.#machine.actions;

    return this.#returnWithWarning(
      toAction<E, Pc, Tc>(events, action, actions),
      `Action (${action}) is not defined`,
    );
  };

  toPredicate = (guard: GuardConfig) => {
    const events = this.#machine.eventsMap;
    const predicates = this.#machine.predicates;

    const { predicate, errors } = toPredicate<E, Pc, Tc>(
      events,
      guard,
      predicates,
    );

    return this.#returnWithWarning(predicate, ...errors);
  };

  toPromiseSrc = (src: string) => {
    const events = this.#machine.eventsMap;
    const promises = this.#machine.promises;

    return this.#returnWithWarning(
      toPromiseSrc<E, Pc, Tc>(events, src, promises),
      `Promise (${src}) is not defined`,
    );
  };

  toDelay = (delay: string) => {
    const events = this.#machine.eventsMap;
    const delays = this.#machine.delays;

    return this.#returnWithWarning(
      toDelay<E, Pc, Tc>(events, delay, delays),
      `Delay (${delay}) is not defined`,
    );
  };

  toMachine = (machine: ActionConfig) => {
    const machines = this.#machine.machines;

    return this.#returnWithWarning(
      toMachine<E, Tc>(machine, machines),
      `Machine (${reduceAction(machine)}) is not defined`,
    );
  };

  protected createChild: Fn = interpret;

  #reduceChild = <T extends AnyMachine = AnyMachine>(
    { subscribers, machine, initials }: ChildS<E, Tc, T>,
    id?: string,
  ) => {
    let service = t.unknown<InterpreterFrom<T>>(
      this.#childrenServices.find(f => f.id === id),
    );

    if (!service) {
      service = this.createChild(machine, initials);
      if (id) service.id = id;
    }

    this.#childrenServices.push(t.any(service));

    const subscriber = service.addFullSubscriber((_, events1) => {
      const _subscribers = toArray.typed(subscribers);

      _subscribers.forEach(({ contexts, events }) => {
        const check1 = typeof events1 === 'string';
        const events2 = service.event;
        const check2 = typeof events2 === 'string';
        const check3 = check1 || check2;

        const checkEvents =
          check3 ||
          reduceEvents(t.any(events), events1.type, events2.type);

        const checkContexts = contexts === true;
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
                const pContext = mergeByKey(this.#pContext)(
                  path,
                  service.#context,
                );
                const callback = () => this.#merge({ pContext });
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
    });

    return subscriber;
  };

  [Symbol.dispose] = () => {
    this.stop();
  };
}

export type InterpreterFrom<M extends AnyMachine> = Interpreter<
  ConfigFrom<M>,
  PrivateContextFrom<M>,
  ContextFrom<M>,
  EventsMapFrom<M>,
  MachineOptionsFrom<M>
>;

export const interpret: Interpreter_F = (
  machine,
  { context, pContext, mode },
) => {
  const out = new Interpreter(machine, mode);

  out.ppC(pContext);
  out.provideContext(context);

  return out;
};
