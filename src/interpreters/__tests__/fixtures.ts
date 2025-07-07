import sleep from '@bemedev/sleep';
import { t } from '@bemedev/types';
import { DEFAULT_NOTHING } from '~constants';
import type { EventArg, EventsMap, PromiseeMap } from '~events';
import type { Interpreter } from '~interpreter';
import type {
  Config,
  GetEventsFromConfig,
  MachineOptions,
  SimpleMachineOptions2,
} from '~machines';
import type { StateValue } from '~states';
import type { PrimitiveObject } from '~types';
import { IS_TEST } from '~utils';

export const defaultC = { pContext: {}, context: {} };
export const defaultT = { ...defaultC, eventsMap: {}, promiseesMap: {} };
export const defaultI = { '/': 'idle' } as const;

export const fakeWaiter = async (ms = 0, times = 1) => {
  const check = vi.isFakeTimers();
  for (let i = 0; i < times; i++) {
    if (check) await vi.advanceTimersByTimeAsync(ms);
    else await sleep(ms);
  }
};

type ConstructWaiter_F = (
  DELAY?: number,
) => (times: number, index: number) => [string, () => Promise<void>];

export const constructWaiter: ConstructWaiter_F = (DELAY = 0) => {
  return (times, index) => {
    const invite = `#${index < 10 ? '0' + index : index} => Wait ${times} times the delay`;

    return t.tuple(invite, () => fakeWaiter(DELAY, times));
  };
};

type ConstructValue_F = <
  const C extends Config = Config,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  E extends EventsMap = GetEventsFromConfig<C>,
  P extends PromiseeMap = PromiseeMap,
  Mo extends SimpleMachineOptions2 = MachineOptions<C, E, P, Pc, Tc>,
>(
  service: Interpreter<C, Pc, Tc, E, P, Mo>,
) => (value: StateValue, index: number) => [string, () => void];

export const constructValue: ConstructValue_F = service => {
  return (value, index) => {
    const _value = JSON.stringify(value);
    const _index = index < 10 ? '0' + index : index;
    const invite = `#${_index} => current value is :${_value}`;

    return t.tuple(invite, () => {
      expect(service.value).toEqual(value);
    });
  };
};

type ConstructSend_F = <
  const C extends Config = Config,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  E extends EventsMap = GetEventsFromConfig<C>,
  P extends PromiseeMap = PromiseeMap,
  Mo extends SimpleMachineOptions2 = MachineOptions<C, E, P, Pc, Tc>,
>(
  service: Interpreter<C, Pc, Tc, E, P, Mo>,
) => (_event: EventArg<E>, index: number) => [string, () => void];

export const constructSend: ConstructSend_F = service => {
  return (_event, index) => {
    const event = JSON.stringify(_event);
    const _index = index < 10 ? '0' + index : index;
    const invite = `#${_index}=> send ${event}`;

    return t.tuple(invite, () => {
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
