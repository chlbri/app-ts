import type { EventsMap, PromiseeMap } from '~events';
import type { Machine } from '~machine';
import type {
  Config,
  MachineOptions,
  SimpleMachineOptions2,
} from '~machines';
import type { PrimitiveObject } from '~types';
import type { InterpreterTest } from './interpreterTest';

export type InterpreterTest_F = <
  const C extends Config = Config,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Mo extends SimpleMachineOptions2 = MachineOptions<C, E, P, Pc, Tc>,
>(
  machine: Machine<C, Pc, Tc, E, P, Mo>,
  config: { pContext: Pc; context: Tc },
) => InterpreterTest<C, Pc, Tc, E, P, Mo>;
