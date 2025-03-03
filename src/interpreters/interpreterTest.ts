import { createInterval } from '@bemedev/interval2';
import type { EventsMap, PromiseeMap } from '~events';
import type {
  Config,
  MachineOptions,
  SimpleMachineOptions2,
} from '~machines';
import type { PrimitiveObject } from '~types';
import { Interpreter } from './interpreter';
import type { CreateInterval2_F } from './interpreter.types';
import type { InterpreterTest_F } from './interpreterTest.types';

class InterpreterTest<
  const C extends Config = Config,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Mo extends SimpleMachineOptions2 = MachineOptions<C, E, P, Pc, Tc>,
> extends Interpreter<C, Pc, Tc, E, P, Mo> {
  protected createInterval: CreateInterval2_F = ({
    callback,
    id,
    interval = 100,
  }) => {
    const out = createInterval({
      callback,
      id,
      interval,
      exact: true,
    });

    return out;
  };

  get intervalsArePaused() {
    return this._cachedIntervals.every(({ state }) => state === 'paused');
  }

  protected interpretChild = interpretTest;
}

export type { InterpreterTest };

export type AnyInterpreterTest = InterpreterTest<
  Config,
  any,
  PrimitiveObject,
  any,
  any,
  SimpleMachineOptions2
>;

export const interpretTest: InterpreterTest_F = (
  machine,
  { context, pContext },
) => {
  const out = new InterpreterTest(machine);

  out.ppC(pContext);
  out.provideContext(context);

  return out;
};
