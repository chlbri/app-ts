/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-private-class-members */
import { toArray } from '@bemedev/basifun';
import cloneDeep from 'clone-deep';
import { deepmerge } from 'deepmerge-ts';
import type { ActionConfig } from '~actions';
import type { EventsMap, ToEvents } from '~events';
import type { GuardConfig } from '~guards';
import { getEntries, getExits, type Machine } from '~machine';
import type { PromiseConfig } from '~promises';
import { nextSV, type StateValue } from '~states';
import type { TransitionConfig } from '~transitions';
import type { PrimitiveObject } from '~types';
import { flatMap } from './flatMap';
import {
  INIT_EVENT,
  type Interpreter_F,
  type Mode,
  type PerformAction_F,
  type PerformDelay_F,
  type PerformPredicate_F,
  type ToAction_F,
  type ToDelay_F,
  type ToPredicate_F,
  type WorkingStatus,
} from './interpreter.types';
import { nodeToValue } from './nodeToValue';
import { resolveNode } from './resolveState';
import { toAction } from './toAction';
import { toDelay } from './toDelay';
import { toMachine } from './toMachine';
import { toPredicate } from './toPredicate';
import { toPromise } from './toPromise';
import { toTransition } from './toTransition';
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
  #flat: RecordS<NodeConfigWithInitials>;
  #value: StateValue;
  #mode: Mode;
  readonly #initialNode: Node<E, Pc, Tc>;
  #currentNode: Node<E, Pc, Tc>;
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
    this.#config = this.#initialConfig;

    this.#value = nodeToValue(this.#config);
    this.#mode = mode;
    this.#initialNode = this.#resolveNode(this.#initialConfig) as any;
    this.#currentNode = this.#initialNode;

    const configForFlat = this.#machine.postConfig as NodeConfig;
    this.#flat = flatMap(configForFlat, false) as any;
  }

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
    return this.#currentNode;
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

    //TODO some verifs
    this.#pContext = deepmerge(this.#pContext, pContext) as any;
    this.#context = deepmerge(this.#context, context) as any;

    this.#status = 'started';
    return { pContext, context };
  };

  #performActions = (...actions: ActionConfig[]) => {
    return actions.map(this.toAction).forEach(this.#executeAction);
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

  #performDelays = (...delays: string[]) => {
    return delays.map(this.toDelay).forEach(this.#executeDelay);
  };

  #performTransition = (transition: TransitionConfig) => {
    const check = typeof transition == 'string';
    if (check) return transition;

    const { guards, actions, target } = transition;
    const response = this.#performGuards(...toArray<GuardConfig>(guards));
    if (response) {
      this.#performActions(...toArray<ActionConfig>(actions));
      return target;
    }
    return;
  };

  // #region TODO
  //TODO perform activities
  //TODO perform promises
  //TODO perform wait delays

  // #endregion

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
  protected _send = (event: Exclude<ToEvents<E>, string>) => {
    this.#event = event;
    const flat = this.#flat;
    const entries = Object.entries(flat);
    const transitionConfigs: TransitionConfig[] = [];

    entries.forEach(([, node]) => {
      const on = node.on;
      const type = event.type;
      if (on) {
        transitionConfigs.push(...toArray<TransitionConfig>(on[type]));
      }
    });

    const transitions = transitionConfigs.map(config =>
      toTransition<E, Pc, Tc>({
        config,
        events: this.#machine.eventsMap,
        options: this.#machine.options,
        mode: this.#mode,
      }),
    );
  };

  #proposedNextSV = (target: string) => nextSV(this.#value, target);

  protected proposedNextConfig = (target: string) => {
    const nextValue = this.#proposedNextSV(target);
    const out = this.#machine.valueToConfig(nextValue);

    return out;
  };

  #diffEntries: string[] = [];
  #diffExits: string[] = [];

  #diffNext = (target: string) => {
    const next = this.proposedNextConfig(target) as NodeConfig;
    const flatNext = flatMap(next);
    const entriesCurrent = Object.entries(this.#flat);
    const keysNext = Object.keys(flatNext);
    const keys = entriesCurrent.map(([key]) => key);

    // #region Entry actions
    // These actions are from next config states that are not inside the previous
    keysNext.forEach(key => {
      const check2 = !keys.includes(key);

      if (check2) {
        const out2 = this.#machine.retrieveParentFromInitial(key);
        this.#diffEntries.push(...getEntries(out2));
      }
    });
    // #endregion

    // #region Exit actions
    // These actions are from previous config states that are not inside the next
    entriesCurrent.forEach(([key, node]) => {
      const check2 = !keysNext.includes(key);

      if (check2) {
        this.#diffExits.push(...getExits(node as any));
      }
    });
    // #endregion
  };

  // #region to review
  // protected nextSimple = (target: string) => {
  //   const config = this.proposedNextConfig(target);
  //   const out = toSimple(config);

  //   return out;
  // };
  // #endregion

  #makeWork = () => {
    this.#status = 'working';
  };
  protected next = (...targets: string[]) => {
    // this.#finishExists();
    const current = this.#config as NodeConfig;
    this.#flat = flatMap(current, false) as any;

    targets.forEach(this.#diffNext);
    this.#performActions(...this.#diffExits);
    this.#performActions(...this.#diffEntries);

    this.#makeWork();
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

  toPromise = (promise: PromiseConfig) => {
    const events = this.#machine.eventsMap;
    const options = this.#machine.options;
    const mode = this.#mode;

    return toPromise({ promise, events, options, mode });
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
