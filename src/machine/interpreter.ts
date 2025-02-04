import { MAX_EXCEEDED_EVENT_TYPE } from './constants';
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-private-class-members */
import { isDefined, partialCall } from '@bemedev/basifun';
import { decomposeSV } from '@bemedev/decompose';
import sleep from '@bemedev/sleep';
import cloneDeep from 'clone-deep';
import { deepmerge } from 'deepmerge-ts';
import type { ActionConfig } from '~actions';
import { DEFAULT_DELIMITER } from '~constants';
import type { EventsMap, ToEvents } from '~events';
import type { GuardConfig } from '~guards';
import { getEntries, getExits, type Machine } from '~machine';
import type { PromiseConfig } from '~promises';
import { nextSV, type StateValue } from '~states';
import type { TransitionConfig } from '~transitions';
import { isDescriber, type PrimitiveObject } from '~types';
import { replaceAll, toArray } from '~utils';
import {
  CATCH_EVENT_TYPE,
  DEFAULT_MAX_PROMISE,
  THEN_EVENT_TYPE,
} from './constants';
import { flatMap } from './flatMap';
import {
  performRemaining,
  possibleEvents,
  sleepU,
} from './interpreter.helpers';
import {
  INIT_EVENT,
  type _Send_F,
  type Contexts,
  type ExecuteActivities_F,
  type Interpreter_F,
  type Mode,
  type PerformAction_F,
  type PerformAfter_F,
  type PerformDelay_F,
  type PerformPredicate_F,
  type PerformPromise_F,
  type PerformPromisees_F,
  type PerformTransition_F,
  type PerformTransitions_F,
  type PromiseeResult,
  type Remaininigs,
  type ToAction_F,
  type ToDelay_F,
  type ToPredicate_F,
  type ToPromiseSrc_F,
  type WorkingStatus,
} from './interpreter.types';
import { nodeToValue } from './nodeToValue';
import { resolveNode } from './resolveState';
import { toAction } from './toAction';
import { toDelay } from './toDelay';
import { toMachine } from './toMachine';
import { toPredicate } from './toPredicate';
import { toPromiseSrc } from './toPromise';
import type {
  Action,
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

  get #canBeStoped() {
    return this.#status === 'started';
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

  constructor(machine: Machine<C, Pc, Tc, E, Mo>, mode: Mode = 'normal') {
    this.#machine = machine.renew;

    this.#initialConfig = this.#machine.initialConfig;
    this.#initialNode = this.#resolveNode(this.#initialConfig) as any;
    this.#mode = mode;
    this.#config = this.#initialConfig;

    this.#performConfig();
  }

  #performConfig = () => {
    this.#value = nodeToValue(this.#config);
    this.#node = this.#resolveNode(this.#config) as any;
    const configForFlat = this.#config as NodeConfig;
    this.#flat = flatMap(configForFlat, false) as any;
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

  #startStatus = (): WorkingStatus => (this.#status = 'started');

  start = () => {
    this.#startStatus();
    this.#startInitialEntries();
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

    this.#status = 'started';
    return { pContext, context };
  };

  get #contexts(): Contexts<Pc, Tc> {
    return {
      pContext: cloneDeep(this.#pContext),
      context: structuredClone(this.#context),
    };
  }

  #performActions = (...actions: ActionConfig[]) => {
    return actions
      .map(this.toAction)
      .map(this.#executeAction)
      .reduce((acc, value) => {
        return deepmerge(acc, value) as any;
      }, this.#contexts);
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

    this.#status = 'started';
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

    //TODO some verifs

    this.#status = 'started';
    return out;
  };

  #executeActivity: ExecuteActivities_F = activities => {
    const entries = Object.entries(activities);
    const promises: (() => Promise<void>)[] = [];

    entries.forEach(([_delay, _activity]) => {
      const delay = this.#executeDelay(this.toDelay(_delay));
      const activities2 = toArray.typed(_activity);

      const promise = async () => {
        await sleep(delay);
        activities2.forEach(activity => {
          const check1 = typeof activity === 'string';
          const check2 =
            typeof activity === 'object' && 'name' in activity;

          const check3 = check1 || check2;

          if (check3) return this.#performActions(activity);

          const check5 = this.#performGuards(
            ...toArray<GuardConfig>(activity.guards),
          );
          if (check5)
            return this.#performActions(
              ...toArray<ActionConfig>(activity.actions),
            );
        });
      };

      promises.push(promise);
    });

    return Promise.race(promises.map(promise => promise()));
  };

  #performTransition: PerformTransition_F<Pc, Tc> = transition => {
    const check = typeof transition == 'string';
    if (check) return transition;

    const { guards, actions, target } = transition;
    const response = this.#performGuards(...toArray<GuardConfig>(guards));
    if (response) {
      const result = this.#performActions(
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
        const result = this.#performActions(final);
        return result;
      }

      const response = this.#performGuards(...toArray.typed(final.guards));
      if (response) {
        const result = this.#performActions(
          ...toArray.typed(final.actions),
        );
        return result;
      }
    }
    return;
  };

  //TODO add an array to mark all promises started by state

  get #sending() {
    return this.#status === 'sending';
  }

  #remaining: RecordS<
    () => {
      target?: string;
      result: Contexts<Pc, Tc>;
    }
  > = {};

  #addRemainingPromise = (
    state: string,
    remain: () => {
      target?: string;
      result: Contexts<Pc, Tc>;
    },
  ) => {
    const key = `${state}::promise`;
    this.#remaining[key] = remain;
  };

  #addRemainingAfter = (
    state: string,
    remain: () => {
      target?: string;
      result: Contexts<Pc, Tc>;
    },
  ) => {
    const key = `${state}::after`;
    this.#remaining[key] = remain;
  };

  #performPromisees: PerformPromisees_F<Pc, Tc> = async (
    from,
    ...promisees
  ) => {
    type PR = PromiseeResult<Pc, Tc>;
    type Events = PR['event'];
    // #region Constants
    let event: Events = MAX_EXCEEDED_EVENT_TYPE;
    let target: PR['target'] = undefined;
    let result: PR['result'] = this.#contexts;

    const promises: Promise<PR | undefined>[] = [];

    const remains: Remaininigs<Pc, Tc> = [];
    // #endregion

    promisees.forEach(
      ({ src, then, catch: _catch, finally: _finally, max: maxS }) => {
        const promiseF = this.toPromiseSrc(src);

        const _promises: Promise<PR | undefined>[] = [
          DEFAULT_MAX_PROMISE.then(() => ({
            event,
            result,
            target,
          })),
        ];

        const handlePromise = (type: 'then' | 'catch', payload: any) => {
          const out = () => {
            event = {
              type: type === 'then' ? THEN_EVENT_TYPE : CATCH_EVENT_TYPE,
              payload,
            };

            const transitions = toArray.typed(
              type === 'then' ? then : _catch,
            );
            const transition = this.#performTransitions(...transitions);

            target = transition.target;
            result = deepmerge(
              result,
              transition.result,
              this.#performFinally(_finally),
            );

            return { event, result, target };
          };

          const check = this.#sending || !this.#isInsideValue(from);
          if (check) {
            const remain = () => {
              const { event, ...rest } = out();
              return rest;
            };

            remains.push(remain);
            return;
          }
          return out();
        };

        const _promise = this.#performPromiseSrc(promiseF)
          .then(partialCall(handlePromise, 'then'))
          .catch(partialCall(handlePromise, 'catch'));

        _promises.push(_promise);

        const check = isDefined(maxS);
        if (check) {
          const max = this.#performDelay(this.toDelay(maxS));
          _promises.push(
            sleepU(max).then(() => ({
              event,
              result,
              target,
            })),
          );
        }

        const promise = Promise.race(_promises);

        promises.push(promise);
      },
    );

    const remaining = performRemaining(...remains);

    const finalize = () => {
      this.#addRemainingPromise(from, remaining);
    };

    return Promise.allSettled(promises).finally(finalize);
  };

  get possibleEvents() {
    return this.#possibleEvents;
  }

  canEvent = (eventS: string) => {
    return this.#possibleEvents.includes(eventS);
  };

  #performAfter: PerformAfter_F<Pc, Tc> = async (from, after) => {
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

    let target: string | undefined = undefined;
    let result: Contexts<Pc, Tc> = {};

    entries.forEach(([_delay, transition]) => {
      const delay = this.#executeDelay(this.toDelay(_delay));
      const transitions = toArray.typed(transition);

      const promise = sleep(delay).then(() => {
        const remain = () => {
          const out = this.#performTransitions(...transitions);
          target = out.target;
          result = out.result ?? {};

          return { target, result };
        };

        const check = this.#sending || !this.#isInsideValue(from);
        if (check) {
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

  //TODO build Event loop with priorities / order

  #startInitialEntries = () =>
    this.#performActions(...getEntries(this.#initialConfig));

  // #finishExists = () => this.#performIO(...getExits(this.#currentConfig));

  stop = () => {
    if (this.#canBeStoped) this.#status = 'started';
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

  //TODO many froms and many targets
  protected _send: _Send_F<E, Pc, Tc> = (
    from: string,
    event: Exclude<ToEvents<E>, string>,
  ) => {
    const check1 = !this.#isInsideValue(from);
    if (check1) return;

    type PR = PromiseeResult<Pc, Tc>;
    let target: PR['target'] = undefined;
    let result: PR['result'] = this.#contexts;

    this.#event = event;
    this.#status = 'sending';

    const flat = this.#flat;
    const entries = Object.entries(flat);
    const transitions: TransitionConfig[] = [];

    entries.forEach(([, node]) => {
      const on = node.on;
      const type = event.type;
      if (on) {
        transitions.push(...toArray.typed(on[type]));
      }
    });

    let _result: PR['result'] = this.#contexts;

    transitions.forEach(_transition => {
      const transition = this.#performTransitions(_transition);

      target = transition.target;
      _result = deepmerge(result, transition.result);
    });

    if (target !== undefined) {
      const { diffEntries, diffExits, next } = this.#diffNext(target);

      result = deepmerge(
        result,
        this.#performActions(...diffExits),
        this.#performActions(...diffEntries),
        _result,
      ) as any;

      return { result, next };
    }

    return { result };
  };

  send = (from: string, event: Exclude<ToEvents<E>, string>) => {
    const sends = this._send(from, event);
    const check1 = sends === undefined;

    if (check1) return;
    const { result, next } = sends;
    const check2 = next !== undefined;

    this.#pContext = deepmerge(this.#pContext, result.pContext) as any;
    this.#context = deepmerge(this.#context, result.context) as any;

    if (check2) {
      this.#config = next;
      this.#performConfig();
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
    const flatNext = flatMap(next);
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
        diffExits.push(...getExits(node as any));
      }
    });
    // #endregion

    return { next: _next, diffEntries, diffExits };
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

  toDelay: ToDelay_F<E, Pc, Tc> = delay => {
    const events = this.#machine.eventsMap;
    const delays = this.#machine.delays;
    const mode = this.#mode;

    return toDelay({ delay, events, delays, mode });
  };

  toMachine = (machine: ActionConfig) => {
    const events = this.#machine.eventsMap;
    const machines = this.#machine.machines;
    const mode = this.#mode;

    return toMachine({ machine, events, machines, mode });
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
