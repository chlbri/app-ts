import { DEFAULT_NOTHING } from '#constants';
import type { EventArg, EventsMap, PromiseeMap } from '#events';
import type { Interpreter } from '#interpreter';
import type {
  Config,
  GetEventsFromConfig,
  MachineOptions,
  SimpleMachineOptions2,
} from '#machines';
import type { StateValue } from '#states';
import { IS_TEST } from '#utils';
import sleep from '@bemedev/sleep';
import type { types } from '@bemedev/types';
import { castings } from '@bemedev/types';

export const defaultC = { pContext: {}, context: {} } as const;
export const defaultT = {
  ...defaultC,
  eventsMap: {},
  promiseesMap: {},
} as const;
export const defaultI = { initials: { '/': 'idle' } } as const;

export const fakeWaiter = async (ms = 0, times = 1) => {
  const check = vi.isFakeTimers();
  const duration = ms * times;
  if (check) await vi.advanceTimersByTimeAsync(duration);
  else await sleep(duration);
};

type ConstructWaiter_F = (
  DELAY?: number,
) => (
  times: number,
  index: number,
) => readonly [string, () => Promise<void>];

export const constructWaiter: ConstructWaiter_F = (DELAY = 0) => {
  return (times, index) => {
    const invite = `#${index < 10 ? '0' + index : index} => Wait ${times} times the delay`;

    return castings.arrays.tupleOf(invite, () => fakeWaiter(DELAY, times));
  };
};

type ConstructValue_F = <
  const C extends Config = Config,
  Pc extends types.PrimitiveObject = types.PrimitiveObject,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
  E extends EventsMap = GetEventsFromConfig<C>,
  P extends PromiseeMap = PromiseeMap,
  Mo extends SimpleMachineOptions2 = MachineOptions<C, E, P, Pc, Tc>,
>(
  service: Interpreter<C, Pc, Tc, E, P, Mo>,
) => (value: StateValue, index: number) => readonly [string, () => void];

export const constructValue: ConstructValue_F = service => {
  return (value, index) => {
    const _value = JSON.stringify(value);
    const _index = index < 10 ? '0' + index : index;
    const invite = `#${_index} => current value is :${_value}`;

    return castings.arrays.tupleOf(invite, () => {
      expect(service.value).toEqual(value);
    });
  };
};

type ConstructSend_F = <
  const C extends Config = Config,
  Pc extends types.PrimitiveObject = types.PrimitiveObject,
  Tc extends types.PrimitiveObject = types.PrimitiveObject,
  E extends EventsMap = GetEventsFromConfig<C>,
  P extends PromiseeMap = PromiseeMap,
  Mo extends SimpleMachineOptions2 = MachineOptions<C, E, P, Pc, Tc>,
>(
  service: Interpreter<C, Pc, Tc, E, P, Mo>,
) => (_event: EventArg<E>, index: number) => readonly [string, () => void];

export const constructSend: ConstructSend_F = service => {
  return (_event, index) => {
    const event = JSON.stringify(_event);
    const _index = index < 10 ? '0' + index : index;
    const invite = `#${_index}=> send ${event}`;

    return castings.arrays.tupleOf(invite, () => {
      return service.send(_event);
    });
  };
};

export const asyncNothing = async () => {
  if (IS_TEST) {
    console.log(`${DEFAULT_NOTHING} call ${DEFAULT_NOTHING}`);
    return DEFAULT_NOTHING;
  }
  return;
};

export const mockConsole = () => {
  const fnLog = vi.spyOn(console, 'log');
  const fnError = vi.spyOn(console, 'error');

  beforeAll(() => {
    const fn = () => void 0;
    fnLog.mockImplementation(fn);
    fnError.mockImplementation(fn);
  });

  afterAll(() => {
    fnLog.mockRestore();
    fnError.mockRestore();
  });
};
