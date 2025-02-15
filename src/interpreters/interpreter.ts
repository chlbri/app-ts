import { isDefined, partialCall } from '@bemedev/basifun';
import type { SingleOrArray } from '@bemedev/boolean-recursive';
import { decomposeSV } from '@bemedev/decompose';
import sleep from '@bemedev/sleep';
import { t, type Fn } from '@bemedev/types';
import cloneDeep from 'clone-deep';
import equal from 'fast-deep-equal';
import {
  toAction,
  type Action,
  type ActionConfig,
  type ActionResult,
} from '~actions';
import {
  CATCH_EVENT_TYPE,
  DEFAULT_DELIMITER,
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
import {
  getEntries,
  getExits,
  type AnyMachine,
  type Machine,
} from '~machine';
import {
  getByKey,
  mergeByKey,
  reduceEvents,
  toMachine,
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
  createInterval,
  merge,
  replaceAll,
  toArray,
  type CreateInterval2_F,
  type IntervalTimer,
} from '~utils';
import { performRemaining, possibleEvents } from './interpreter.helpers';
import type {
  _Send_F,
  AddSubscriber_F,
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
> {
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
  get #childrenMachines() {
    const _machines = toArray.typed(this.#machine.preConfig.machines);
    return _machines.map(this.toMachine).filter(isDefined);
  }
  #childrenServices: AnyInterpreter[] = [];

  id?: string;

  // get #canBeStoped() {
  //   return this.#status === 'working';
  // }

  // #region Type getters

  /**
   * @deprecated
   * Just use for typing
   */
  get mo() {
    return this.#machine.mo;
  }

  // #endregion

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

  constructor(machine: Machine<C, Pc, Tc, E, Mo>, mode: Mode = 'normal') {
    this.#machine = machine.renew;

    this.#initialConfig = this.#machine.initialConfig;
    this.#initialNode = this.#resolveNode(this.#initialConfig) as any;
    this.#mode = mode;
    this.#config = this.#initialConfig;

    this.#performConfig();
    this.#scheduler = new Scheduler();
  }

  #performConfig = () => {
    this.#value = nodeToValue(this.#config);
    this.#node = this.#resolveNode(this.#config) as any;
    const configForFlat = this.#config as NodeConfig;
    this.#flat = flatMap(configForFlat) as any;
    this.#possibleEvents = possibleEvents(this.#flat);
  };

  protected iterate = () => this.#iterator++;

  #resolveNode = (config: NodeConfigWithInitials) => {
    const options = this.#machine.options;
    const events = this.#machine.eventsMap;

    return resolveNode(events, config, options);
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

  #startStatus = (): WorkingStatus => (this.#status = 'started');

  start = async () => {
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
    const subscribers = Array.from(this.#subscribers);
    subscribers.forEach(this.#scheduleSubscriber);
  };

  protected next = async () => {
    const previousValue = this.#value;

    this.flushSubscribers();
    this.#rinitIntervals();
    this.#performActivities();
    await this.#performStartTransitions();

    const currentConfig = this.#value;
    const check = !equal(previousValue, currentConfig);

    if (check) await this.next.bind(this)();
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

  get #contexts(): ActionResult<Pc, Tc> {
    return {
      pContext: cloneDeep(this.#pContext),
      context: structuredClone(this.#context),
    } as any;
  }

  #performActions = (
    contexts: ActionResult<Pc, Tc>,
    ...actions: ActionConfig[]
  ) => {
    return actions
      .map(this.toAction)
      .filter(f => f !== undefined)
      .map(value => this.#executeAction(value as any))
      .reduce((acc, value) => {
        const out = merge(acc, value) as any;
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
        this.addWarning(`${_delay} is too short`);
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
        for (const activity of activities) {
          const check2 = typeof activity === 'string';
          const check3 =
            typeof activity === 'object' && 'name' in activity;

          const check4 = check2 || check3;

          if (check4) {
            const { context, pContext } = this.#performActions(
              this.#contexts,
              activity,
            );
            this.#pContext = merge(this.#pContext, pContext) as any;
            this.#context = merge(this.#context, context) as any;
            return;
          }

          const check5 = this.#performGuards(
            ...toArray.typed(activity.guards),
          );
          if (check5) {
            const actions = toArray.typed(activity.actions);
            const { context, pContext } = this.#performActions(
              this.#contexts,
              ...actions,
            );
            this.#pContext = merge(this.#pContext, pContext) as any;
            this.#context = merge(this.#context, context) as any;
            return;
          }
        }
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
      forTest: false,
    });

    return out;
  };

  protected _cachedIntervals: IntervalTimer[] = [];

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
    // type Events = PR['event'];

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

        promises.push(promise as any);
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

    // #region type Promises

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
        this.addWarning(`${_delay} is too long`);
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

    const always = toArray.typed(alway);

    const out = this.#performTransitions(...(always as any));
    const target = out.target;
    const result = merge(this.#contexts, out.result);
    if (target) return { target, result };

    return;
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

      const promise = () => Promise.all(promises.map(p => p()));

      const _resultAfters = await promise().finally(finalize);
      const resultAfters = _resultAfters.filter(isDefined);

      const cb = () => {
        resultAfters.forEach(({ result, target }) => {
          this.#pContext = merge(this.#pContext, result.pContext) as any;
          this.#context = merge(this.#context, result.context) as any;

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
      const out = () => {
        this.#status = 'busy';
        const { target, result } = resultAlways;

        this.#pContext = merge(this.#pContext, result.pContext) as any;
        this.#context = merge(this.#context, result.context) as any;

        if (target) {
          this.#config = this.proposedNextConfig(target);
          this.#performConfig();
        }
        this.#status = 'started';
      };

      this.#scheduler.schedule(out);
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
          this.#pContext = merge(
            this.#pContext,
            value.result.pContext,
          ) as any;

          this.#context = merge(
            this.#context,
            value.result.context,
          ) as any;

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
      this.#reduceSubscribe(child);
    });

    this.#childrenServices.forEach(child => {
      child.start();
    });
  };

  #performStartTransitions = async () => {
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

    await Promise.all(promises.map(p => p())).finally(() => {
      return this.#makeWork();
    });
  };

  #startInitialEntries = () => {
    const actions = getEntries(this.#initialConfig);
    return this.#performActions(this.#contexts, ...actions);
  };

  // #finishExists = () => this.#performIO(...getExits(this.#currentConfig));

  pause = () => {
    this.#rinitIntervals();
    this.#status = 'paused';
  };

  resume = () => {
    if (this.#status === 'paused') {
      this.#status = 'working';
      this.#performActivities();
    }
  };

  stop = () => {
    // if (this.#canBeStoped) {
    this.#status = 'stopped';
    this.#rinitIntervals();
    // }
  };

  #makeBusy = (): WorkingStatus => (this.#status = 'busy');

  // #region Types
  providePrivateContext = (pContext: Pc) => {
    this.#initialPpc = pContext;
    this.#pContext = pContext;
    this.#makeBusy();

    if (this.#idle) {
      this.#machine = this.#machine.providePrivateContext(
        this.#initialPpc,
      ) as any;
    }

    this.#status = 'starting';
    return this.#machine;
  };

  ppC = this.providePrivateContext;

  provideContext = (context: Tc) => {
    this.#initialContext = context;
    this.#context = context;
    this.#makeBusy();

    if (this.#idle) {
      this.#machine = this.#machine.provideContext(
        this.#initialContext,
      ) as any;
    }

    this.#status = 'starting';
    return this.#machine;
  };
  // #endregion

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
      this.#machine.addGuards(out);
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

  addSubscriber: AddSubscriber_F<E, Tc> = _subscriber => {
    const eventsMap = this.#machine.eventsMap;

    const subcriber = createSubscriber(eventsMap, _subscriber);
    this.#subscribers.add(subcriber);
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

  protected addError = (error: string) => {
    this.#errorsCollector.add(error);
  };

  protected addWarning = (error: string) => {
    this.#errorsCollector.add(error);
  };

  // #region Next

  protected _send: _Send_F<E, Pc, Tc> = (
    // from: string,
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
      ) as any;
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

    const {
      result: { context, pContext },
      next,
    } = sends;

    this.#pContext = merge(this.#pContext, pContext) as any;
    this.#context = merge(this.#context, context) as any;

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
    const _next = this.proposedNextConfig(target);
    const next = _next as NodeConfig;
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

  // #region to review
  // protected nextSimple = (target: string) => {
  //   const config = this.proposedNextConfig(target);
  //   const out = toSimple(config);

  //   return out;
  // };
  // #endregion

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

  #makeWork = () => {
    this.#status = 'working';
  };

  // #endregion

  toAction = (action: ActionConfig) => {
    const events = this.#machine.eventsMap;
    const actions = this.#machine.actions;

    return toAction(events, action, actions);
  };

  toPredicate = (guard: GuardConfig) => {
    const events = this.#machine.eventsMap;
    const predicates = this.#machine.predicates;

    return toPredicate(events, guard, predicates);
  };

  toPromiseSrc = (src: string) => {
    const events = this.#machine.eventsMap;
    const promises = this.#machine.promises;

    return toPromiseSrc(events, src, promises);
  };

  //TODO retrieve options for all can be undefined

  toDelay = (delay?: string) => {
    const events = this.#machine.eventsMap;
    const delays = this.#machine.delays;

    return toDelay(events, delay, delays);
  };

  toMachine = (machine: ActionConfig) => {
    const machines = this.#machine.machines;

    return toMachine<E, Tc>(machine, machines);
  };

  protected createChild: Fn = interpret;

  #reduceSubscribe = <T extends AnyMachine = AnyMachine>(
    { subscribers, machine, initials }: ChildS<E, Tc, T>,
    id?: string,
  ) => {
    let service = t.anify<InterpreterFrom<T>>(
      this.#childrenServices.find(f => f.id === id),
    );

    if (!service) {
      service = this.createChild(machine as any, initials);

      if (id) service.id = id;
    }

    // const service;

    this.#childrenServices.push(service as any);
    // const _subscribers = toArray.typed(subscribers);

    const subscriber = this.addSubscriber((_, events1) => {
      const check1 = typeof events1 === 'string';
      if (check1) return;

      // const event = events1.type;

      let callback = t.anify<() => void>();
      const _subscribers = toArray.typed(subscribers);
      _subscribers.forEach(({ contexts, events }) => {
        const checkContexts = contexts === true;

        const events2 = service.event;
        const check2 = typeof events2 === 'string';
        if (check2) return;

        const checkEvents = reduceEvents(
          events as any,
          events2.type,
          events1.type,
        );

        if (checkEvents) {
          if (checkContexts) {
            callback = () => (this.#context = service.context as any);
          } else {
            const _contexts = contexts as SingleOrArray<
              string | Record<string, string | string[]>
            >;
            const contexts2 = toArray.typed(_contexts);

            contexts2.forEach(context => {
              if (typeof context === 'string') {
                const merger = mergeByKey(this.#context)(
                  context,
                  service.context,
                );
                callback = () =>
                  (this.#context = merge(this.#context, merger) as any);
              } else {
                const entries = Object.entries(context).map(
                  ([key, value]) => {
                    const values = toArray.typed(value);
                    return t.tuple(key, values);
                  },
                );

                entries.forEach(([key, values]) => {
                  values.forEach(value => {
                    const merger = mergeByKey(this.#context)(
                      key,
                      getByKey(service.context, value),
                    );
                    callback = () =>
                      (this.#context = merge(
                        this.#context,
                        merger,
                      ) as any);
                  });
                });
              }
            });
          }
        }
      });

      if (callback) this.#scheduler.schedule(callback);
    });

    return subscriber;
  };

  [Symbol.dispose] = () => {
    this.stop();
  };
}

export type AnyInterpreter = {
  mode: Mode;
  event: ToEvents<any>;
  eventsMap: EventsMap;
  initialNode: Node<any, any, any>;
  node: Node<any, any, any>;
  makeStrict: () => void;
  makeStrictest: () => void;
  status: WorkingStatus;
  initialConfig: NodeConfigWithInitials;
  initialValue: StateValue;
  config: NodeConfigWithInitials;
  renew: Interpreter<any, any, any, any, any>;
  value: StateValue;
  context: any;
  start: () => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  providePrivateContext: (pContext: any) => AnyMachine;
  ppC: (pContext: any) => AnyMachine;
  provideContext: (context: any) => AnyMachine;
  addAction: (key: string, action: Action<any, any, any>) => void;
  addGuard: (key: string, guard: PredicateS<any, any, any>) => void;
  addPromise: (
    key: string,
    promise: PromiseFunction<any, any, any>,
  ) => void;
  addDelay: (key: string, delay: Delay<any, any, any>) => void;
  addMachine: (key: string, machine: Child<any, any>) => void;
  addSubscriber: AddSubscriber_F<any, any>;
  errorsCollector: Set<string>;
  warningsCollector: Set<string>;
  send: (event: EventArg<any>) => Promise<void>;
  canEvent: (eventS: string) => boolean;
  possibleEvents: string[];
  flushSubscribers: () => void;
  toAction: (action: ActionConfig) => Action<any, any, any> | undefined;
  toPredicate: (
    guard: GuardConfig,
  ) => PredicateS<any, any, any> | undefined;
  toPromiseSrc: (
    src: string,
  ) => PromiseFunction<any, any, any> | undefined;
  toDelay: (delay?: string) => Delay<any, any, any> | undefined;
  toMachine: (machine: ActionConfig) => AnyMachine | undefined;
  id?: string;
};

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
