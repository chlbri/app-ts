import { isDefined, partialCall } from '@bemedev/basifun';
import { decomposeSV } from '@bemedev/decompose';
import sleep from '@bemedev/sleep';
import { t } from '@bemedev/types';
import cloneDeep from 'clone-deep';
import { deepmerge } from 'deepmerge-ts';
import equal from 'fast-deep-equal';
import type { ActionConfig } from '~actions';
import { DEFAULT_DELIMITER } from '~constants';
import {
  transformEventArg,
  type EventArg,
  type EventsMap,
  type ToEvents,
} from '~events';
import type { GuardConfig } from '~guards';
import { getEntries, getExits, type Machine } from '~machine';
import type { PromiseConfig } from '~promises';
import { nextSV, type StateValue } from '~states';
import type {
  AlwaysConfig,
  DelayedTransitions,
  TransitionConfig,
} from '~transitions';
import { isDescriber, type PrimitiveObject } from '~types';
import { replaceAll, toArray } from '~utils';
import {
  CATCH_EVENT_TYPE,
  MAX_TIME_PROMISE,
  MIN_ACTIVITY_TIME,
  THEN_EVENT_TYPE,
} from './constants';
import { flatMap } from './flatMap';
import { getInitialNodeConfig } from './getInitialNodeConfig';
import { performRemaining, possibleEvents } from './interpreter.helpers';
import type {
  _Send_F,
  Contexts,
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
  PromiseeResult,
  Remaininigs,
  ToAction_F,
  ToDelay_F,
  ToPredicate_F,
  ToPromiseSrc_F,
  WorkingStatus,
} from './interpreter.types';
import { INIT_EVENT } from './interpreter.types';
import {
  createInterval,
  type CreateInterval2_F,
  type IntervalTimer,
} from './interval';
import { nodeToValue } from './nodeToValue';
import { resolveNode } from './resolveNode';
import { Scheduler } from './scheduler';
import { toAction } from './toAction';
import { toDelay } from './toDelay';
import { toMachine } from './toMachine';
import { toPredicate } from './toPredicate';
import { toPromiseSrc } from './toPromise';
import type {
  Action,
  ActivityConfig,
  Child,
  Config,
  Delay,
  Keys,
  MachineOptions,
  Node,
  NodeConfig,
  NodeConfigWithInitials,
  PredicateS,
  PromiseFunction,
  RecordS,
  SimpleMachineOptions2,
} from './types';
import { withTimeout } from './withTimeout';

export class Interpreter<
  const C extends Config = Config,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  E extends EventsMap = EventsMap,
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

  // get #canBeStoped() {
  //   return this.#status === 'working';
  // }

  get #idle() {
    return this.#status === 'idle';
  }

  get #canAct() {
    return this.#status === 'started';
  }

  get event() {
    return this.#event;
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
    const mode = this.#mode;
    const events = this.#machine.eventsMap;

    return resolveNode({ config, options, mode, events });
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
    await this.next();
  };

  #rinitIntervals = () => {
    this.cachedIntervals.forEach(f => {
      const check = f.state === 'active';
      if (check) this.#scheduler.schedule(f.pause.bind(f));
    });
  };

  protected next = async () => {
    const previousValue = this.#config;
    console.warn('previousValue', previousValue);

    this.#rinitIntervals();
    this.#performActivities();
    await this.#performStartTransitions();

    const currentConfig = this.#config;

    // const check = !equal(previousValue, currentConfig);
    console.warn('current', currentConfig);

    // if (check) {
    //   await this.next.bind(this)();
    // }
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

  get #contexts(): Contexts<Pc, Tc> {
    return {
      pContext: cloneDeep(this.#pContext),
      context: structuredClone(this.#context),
    };
  }

  #performActions = (
    contexts: Contexts<Pc, Tc>,
    ...actions: ActionConfig[]
  ) => {
    return actions
      .map(this.toAction)
      .map(this.#executeAction)
      .reduce((acc, value) => {
        const out = deepmerge(acc, value) as any;
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
      const _interval = this.cachedIntervals.find(f => f.id === id);

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
            this.#pContext = deepmerge(this.#pContext, pContext) as any;
            this.#context = deepmerge(this.#context, context) as any;
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
            this.#pContext = deepmerge(this.#pContext, pContext) as any;
            this.#context = deepmerge(this.#context, context) as any;
            return;
          }
        }
      };
      const promise = this.createInterval({
        callback,
        interval,
        id,
      });

      this.cachedIntervals.push(promise);
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

  cachedIntervals: IntervalTimer[] = [];

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
      result: Contexts<Pc, Tc>;
    }
  > = {};

  #produceKeyRemainPromise = (from: string) => `${from}::promise`;

  #addRemainingPromise = (
    state: string,
    remain: () => {
      target?: string;
      result: Contexts<Pc, Tc>;
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
      result: Contexts<Pc, Tc>;
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

    const promises: (() => Promise<PR | undefined>)[] = [];
    const remains: Remaininigs<Pc, Tc> = [];

    promisees.forEach(
      ({ src, then, catch: _catch, finally: _finally, max: maxS }) => {
        const promiseF = this.toPromiseSrc(src);

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
            const result = deepmerge(
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

        const promise = withTimeout(_promise, ...MAX_POMS);

        promises.push(promise);
      },
    );

    const finalize = () => {
      const remaining = performRemaining(...remains);
      this.#addRemainingPromise(from, remaining);
    };

    return { promises, finalize };
  };

  get possibleEvents() {
    return this.#possibleEvents;
  }

  canEvent = (eventS: string) => {
    return this.#possibleEvents.includes(eventS);
  };

  #performAfter: PerformAfter_F<Pc, Tc> = async (from, after) => {
    // #region Checker for reentering
    const key = this.#produceKeyRemainAfter(from);
    const remain = this.#remaining[key];
    const check = remain !== undefined;
    if (check) {
      const out = remain();
      return { ...out, event: this.#event };
    }
    // #endregion

    // #region type Promises
    type Promises = Promise<
      | {
          result: Contexts<Pc, Tc>;
          target?: string;
        }
      | undefined
    >[];
    // #endregion

    const entries = Object.entries(after);
    const promises: Promises = [];
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

      const promise = sleep(delay).then(() => {
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

      promises.push(promise);
    });

    const remaining = performRemaining(...remains);

    const finalize = () => {
      this.#addRemainingAfter(from, remaining);
    };

    return Promise.race(promises).finally(finalize);
  };

  #performAlway: PerformAlway_F<Pc, Tc> = (from, alway) => {
    const check1 = this.#sending || !this.#isInsideValue(from);
    if (check1) return;

    const always = toArray.typed(alway);

    const out = this.#performTransitions(...(always as any));
    const target = out.target;
    const result = deepmerge(this.#contexts, out.result);
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
      .reduce((acc, value) => deepmerge(acc, value));
  }

  #performActivities = () => {
    const collected = this.#collectedActivities;
    const check = collected.length < 1;
    if (check) return;

    const ids: string[] = [];
    for (const args of this.#collectedActivities) {
      ids.push(...this.#executeActivities(...args));
    }

    return this.cachedIntervals
      .filter(({ id }) => ids.includes(id))
      .forEach(f => {
        this.#scheduler.schedule(f.start.bind(f));
      });
  };

  #performAfters = (
    ...afters: [from: string, after: DelayedTransitions][]
  ) => {
    const out = async () => {
      const resultAfter = await Promise.race(
        afters
          .map(args => {
            const promise = () => this.#performAfter(...args);
            return promise;
          })
          .map(f => f()),
      );

      if (resultAfter) {
        const cb = () => {
          const { target, result } = resultAfter;

          this.#pContext = deepmerge(
            this.#pContext,
            result.pContext,
          ) as any;
          this.#context = deepmerge(this.#context, result.context) as any;

          if (target) {
            this.#config = this.proposedNextConfig(target);
            this.#performConfig();
          }
        };

        this.#scheduler.schedule(cb);
      }
    };

    return out;
  };

  #performAlways = () => {
    const resultAlways = this.#_performAlways;

    if (resultAlways) {
      const out = () => {
        this.#status = 'busy';
        const { target, result } = resultAlways;

        this.#pContext = deepmerge(this.#pContext, result.pContext) as any;
        this.#context = deepmerge(this.#context, result.context) as any;

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

    const finalize = values.reduce(
      (acc, value) => {
        const { finalize } = value;
        return () => {
          acc();
          finalize();
        };
      },
      () => {},
    );

    const toPromises = values
      .map(({ promises }) => {
        const check = promises.length < 1;
        if (check) return undefined;
        return promises;
      })
      .filter(f => f !== undefined)
      .flat()
      .map(f => f());

    const check1 = toPromises.length < 1;

    if (check1) {
      console.log('no promises');
      return this.#scheduler.schedule(finalize);
    }

    const promises = await Promise.all(toPromises);

    const cb = () => {
      let target = t.union(t.string, t.undefined);

      console.warn('promises', promises.length);
      promises.forEach(value => {
        if (value) {
          this.#pContext = deepmerge(
            this.#pContext,
            value.result.pContext,
          ) as any;

          this.#context = deepmerge(
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
    this.#scheduler.schedule(finalize);
    // this.nextStart(true);
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

  addMachine = (key: Keys<Mo['machines']>, machine: Child<Pc, Tc>) => {
    if (this.#canAct) {
      const out = { [key]: machine };
      this.#machine.addMachines(out);
    }
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

      result = deepmerge(result, _result);
    });

    // #region Use targets to perform entry and exit actions
    targets.forEach(target => {
      const { diffEntries, diffExits } = this.#diffNext(target);

      sv = nextSV(sv, target);
      result = deepmerge(
        result,
        this.#performActions(result, ...diffExits),
        this.#performActions(result, ...diffEntries),
      ) as any;
    });
    // #endregion

    const check4 = equal(this.#value, sv); //If no changes in state value
    const next = check4
      ? this.#config
      : getInitialNodeConfig(this.#machine.valueToConfig(sv));
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

    this.#pContext = deepmerge(this.#pContext, pContext) as any;
    this.#context = deepmerge(this.#context, context) as any;

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

  toAction: ToAction_F<E, Pc, Tc> = action => {
    const events = this.#machine.eventsMap;
    const actions = this.#machine.actions;
    const mode = this.#mode;

    return toAction({ action, events, actions, mode });
  };

  toPredicate: ToPredicate_F<E, Pc, Tc> = guard => {
    const events = this.#machine.eventsMap;
    const predicates = this.#machine.predicates;
    const mode = this.#mode;

    return toPredicate({ guard, events, predicates, mode });
  };

  toPromiseSrc: ToPromiseSrc_F = src => {
    const events = this.#machine.eventsMap;
    const promises = this.#machine.promises;
    const mode = this.#mode;

    return toPromiseSrc({ src, events, promises, mode }) as any;
  };

  //TODO retrieve options for all can be undefined

  toDelay: ToDelay_F<E, Pc, Tc> = delay => {
    const events = this.#machine.eventsMap;
    const delays = this.#machine.delays;

    return toDelay({ delay, events, delays });
  };

  toMachine = (machine: ActionConfig) => {
    const events = this.#machine.eventsMap;
    const machines = this.#machine.machines;
    const mode = this.#mode;

    return toMachine({ machine, events, machines, mode });
  };

  [Symbol.dispose] = () => {
    this.stop();
  };
}

export type AnyInterpreter = Interpreter<
  Config,
  any,
  PrimitiveObject,
  any,
  SimpleMachineOptions2
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
