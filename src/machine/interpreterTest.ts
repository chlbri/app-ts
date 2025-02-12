import type { EventsMap } from '~events';
import type { PrimitiveObject } from '~types';
import { Interpreter } from './interpreter';
import type { InterpreterTest_F } from './interpreterTest.types';
import { createInterval, type CreateInterval2_F } from './interval';
import type {
  Config,
  MachineOptions,
  SimpleMachineOptions2,
} from './types';

class InterpreterTest<
  const C extends Config = Config,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  E extends EventsMap = EventsMap,
  Mo extends SimpleMachineOptions2 = MachineOptions<C, E, Pc, Tc>,
> extends Interpreter<C, Pc, Tc, E, Mo> {
  protected createInterval: CreateInterval2_F = ({
    callback,
    id,
    interval,
  }) => {
    const out = createInterval({
      callback,
      id,
      interval,
      forTest: true,
    });

    return out;
  };

  get intervalsArePaused() {
    return this._cachedIntervals.every(({ state }) => state === 'paused');
  }
}

export type { InterpreterTest };

export type AnyInterpreterTest = InterpreterTest<
  Config,
  any,
  PrimitiveObject,
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
