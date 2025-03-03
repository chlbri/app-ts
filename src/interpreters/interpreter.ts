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
import { t, type Fn } from '@bemedev/types';
import cloneDeep from 'clone-deep';
import equal from 'fast-deep-equal';
import { EOL } from 'os';
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
  eventToType,
  INIT_EVENT,
  transformEventArg,
  type EventArg,
  type EventsMap,
  type PromiseeMap,
  type ToEvents,
} from '~events';
import { toPredicate, type GuardConfig } from '~guards';
import { getEntries, getExits, type Machine } from '~machine';
import {
  assignByBey,
  getByKey,
  mergeByKey,
  reduceEvents,
  toMachine,
  type AnyMachine,
  type ChildS,
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
import { IS_TEST, measureExecutionTime, replaceAll } from '~utils';
import { merge } from './../utils/merge';
import type {
  _Send_F,
  AddSubscriber_F,
  AnyInterpreter,
  Collected0,
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
  PerformPromisee_F,
  PerformTransition_F,
  PerformTransitions_F,
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

  #childrenServices: AnyInterpreter<E, P, Pc, Tc>[] = [];
  get #childrenMachines() {
    const _machines = toArray.typed(this.#machine.preConfig.machines);
    return _machines.map(this.toMachine).filter(isDefined);
  }

  id?: string;

  get mode() {
    return this.#mode;
  }

  // get #canAct() {
  //   return this.#status === 'started' || this.#status === 'working';
  // }

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
  ) {
    this.#machine = machine.renew;

    this.#initialConfig = this.#machine.initialConfig;
    this.#initialNode = this.#resolveNode(this.#initialConfig);
    this.#mode = mode;
    this.#config = this.#initialConfig;

    this.#performConfig(true);
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

  protected _performConfig = () => {
    this.#value = nodeToValue(this.#config);
    this.#node = this.#resolveNode(this.#config);

    const configForFlat = t.unknown<NodeConfig>(this.#config);
    this.#flat = t.any(flatMap(configForFlat));
  };

  #performConfig = (target?: string | true) => {
    if (target === true) return this._performConfig();

    if (target) {
      this.#config = this.proposedNextConfig(target);
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
   * Call in production will return nothing
   */
  pSelect: Selector_F<Pc> = selector => {
    if (IS_TEST) {
      const pContext = this.pContext;
      if (pContext) return getByKey(pContext, selector);
      /* v8 ignore next 4 */
    }
    console.error('pContext is not available in production');
    return;
  };

  #startStatus = (): WorkingStatus => (this.#status = 'started');

  #displayConsole = (messages: Iterable<string>) => {
    return Array.from(messages).join(EOL);
  };

  start = () => {
    this.#throwing();

    this.#startStatus();
    this.#scheduler.initialize(this.#startInitialEntries);
    this.#performMachines();
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

  #produceSubscriberCallback = (subscriber: Subscriber<E, P, Tc>) => {
    const context = cloneDeep(this.#context);
    const event = structuredClone(this.#event);
    const callback = () => subscriber.reduced(context, event);
    return callback;
  };

  #scheduleSubscriber = (subscriber: Subscriber<E, P, Tc>) => {
    const callback = this.#produceSubscriberCallback(subscriber);
    this.#schedule(callback);
  };

  flushSubscribers = () => {
    this.#subscribers.forEach(this.#scheduleSubscriber);
  };

  #selfTransitionsCounter = 0;

  protected _next = async () => {
    this.#selfTransitionsCounter++;
    const previousValue = this.#value;
    const checkCounter =
      this.#selfTransitionsCounter >= MAX_SELF_TRANSITIONS;

    if (checkCounter) return this.#throwMaxCounter();
    this.#throwing();

    this.flushSubscribers();
    this.#rinitIntervals();
    this.#performActivities();
    await this.#performSelfTransitions();

    const currentConfig = this.#value;
    const check = !equal(previousValue, currentConfig);

    if (check) {
      const duration = await measureExecutionTime(this._next.bind(this));
      const check2 = duration > MIN_ACTIVITY_TIME;
      if (check2) this.#selfTransitionsCounter = 0;
    } else this.#selfTransitionsCounter = 0;
  };

  #performAction: PerformAction_F<E, P, Pc, Tc> = action => {
    this._iterate();
    return action(
      cloneDeep(this.#pContext),
      structuredClone(this.#context),
      structuredClone(this.#event),
    );
  };

  #executeAction: PerformAction_F<E, P, Pc, Tc> = action => {
    this.#makeBusy();
    const { pContext, context } = this.#performAction(action);

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

    this.#status = 'working';
    return out;
  };

  #performPredicates = (...guards: GuardConfig[]) => {
    if (guards.length < 1) return true;
    return guards
      .map(this.toPredicate)
      .filter(isDefined)
      .map(this.#executePredicate)
      .every(bool => bool);
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
            this.#event = t.any({
              type: `${src}::${type}`,
              payload,
            });

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

  #performMachines = () => {
    this.#childrenMachines.forEach(({ id, ...child }) => {
      this.#reduceChild(t.any(child), id);
    });

    this.#childrenServices.forEach(child => {
      child.start();
    });
  };

  get #collected0() {
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

  get #collecteds() {
    const entries = Array.from(this.#collected0);
    const out = entries.map(([from, { after, always, promisee }]) => {
      const promise = async () => {
        if (always) {
          const cb = () => {
            this.#merge(always.result);
            this.#performConfig(always.target);
          };
          this.#schedule(cb);
          return;
        }

        const promises: TimeoutPromise<void>[] = [];
        if (after) {
          const _after = async () => {
            return after().then(transition => {
              if (transition) {
                const cb = () => {
                  this.#merge(transition.result);
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
                  this.#merge(transition.result);
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
    this.#status = 'busy';
    this.#makeBusy();
    await Promise.all(this.#collecteds.map(f => f()));
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
    this.#fullSubscribers.forEach(f => f.close());
    this.#subscribers.forEach(f => f.close());
    this.#childrenServices.forEach(c => c.pause());
    this.#status = 'paused';
  };

  resume = () => {
    if (this.#status === 'paused') {
      this.#status = 'working';
      this.#performActivities();
      this.#fullSubscribers.forEach(f => f.open());
      this.#subscribers.forEach(f => f.open());
      this.#childrenServices.forEach(c => c.resume());
    }
  };

  stop = () => {
    this.pause();
    this.#childrenServices.forEach(c => c.stop());
    this.#status = 'stopped';
  };

  #makeBusy = (): WorkingStatus => (this.#status = 'busy');

  /**
   * @deprecated
   * Uses internal
   */
  providePrivateContext = (pContext: Pc) => {
    this.#initialPpc = pContext;
    this.#pContext = pContext;
    this.#makeBusy();

    this.#machine.addPrivateContext(this.#initialPpc);

    this.#status = 'starting';
    return this.#machine;
  };

  ppC = this.providePrivateContext;

  /**
   * @deprecated
   * Uses internal
   */
  provideContext = (context: Tc) => {
    this.#initialContext = context;
    this.#context = context;
    this.#makeBusy();

    this.#machine.addContext(this.#initialContext);

    this.#status = 'starting';
    return this.#machine;
  };

  // #region Providers

  get addOptions() {
    return this.#machine.addOptions;
  }

  #subscribers = new Set<Subscriber<E, P, Tc>>();
  #fullSubscribers = new Set<Subscriber<E, P, Tc>>();

  addSubscriber: AddSubscriber_F<E, P, Tc> = _subscriber => {
    const eventsMap = this.#machine.eventsMap;
    const promiseesMap = this.#machine.promiseesMap;

    const subcriber = createSubscriber(
      eventsMap,
      promiseesMap,
      _subscriber,
    );
    this.#subscribers.add(subcriber);
    return subcriber;
  };

  addFullSubscriber: AddSubscriber_F<E, P, Tc> = _subscriber => {
    const eventsMap = this.#machine.eventsMap;
    const promiseesMap = this.#machine.promiseesMap;

    const subcriber = createSubscriber(
      eventsMap,
      promiseesMap,
      _subscriber,
    );
    this.#fullSubscribers.add(subcriber);
    return subcriber;
  };
  // #endregion

  #errorsCollector = new Set<string>();
  #warningsCollector = new Set<string>();

  /**
   * @deprecated
   * Just use for testing
   * Call in production will return nothing
   */
  get errorsCollector() {
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
   * Call in production will return nothing
   */
  get warningsCollector() {
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
    // type PR = PromiseeResult<E, Pc, Tc>;

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

    //If no changes in state value, no cahnges in current config
    const next = switchV({
      condition: equal(this.#value, sv),
      truthy: undefined,
      falsy: initialConfig(this.#machine.valueToConfig(sv)),
    });

    return { next, result };
  };

  send = (_event: EventArg<E, P>) => {
    const event = transformEventArg(_event);
    this.#event = event;
    this.#status = 'sending';
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

  #diffNext = (target: string) => {
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

  protected interpretChild: Fn = interpret;

  #reduceChild = <T extends AnyMachine = AnyMachine>(
    { subscribers, machine, initials }: ChildS<E, P, Tc, T>,
    id?: string,
  ) => {
    let service = t.unknown<InterpreterFrom<T>>(
      this.#childrenServices.find(f => f.id === id),
    );

    if (!service) {
      service = this.interpretChild(machine, initials);
      service.id = id;
    }

    this.#childrenServices.push(t.any(service));

    const subscriber = service.addFullSubscriber((_, { type }) => {
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
                  assignByBey(this.#pContext, path, service.#context);
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
    this.#scheduler.stop();
  };

  get [Symbol.asyncDispose]() {
    return asyncfy(this[Symbol.dispose]);
  }
}

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
  { context, pContext, mode },
) => {
  const out = new Interpreter(machine, mode);

  out.ppC(pContext);
  out.provideContext(context);

  return out;
};
