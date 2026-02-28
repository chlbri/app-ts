import _any from '#bemedev/features/common/castings/any';
import tupleOf from '#bemedev/features/arrays/castings/tuple';
import type { PrimitiveObject } from '#bemedev/globals/types';
import { DEFAULT_NOTHING } from '#constants';
import type {
  ActorsConfigMap,
  EventArg,
  EventObject,
  EventsMap,
} from '#events';
import type { Interpreter } from '#interpreter';
import type { AnyInterpreter } from '#interpreters';
import type { StateValue } from '#states';
import { IS_TEST } from '#utils';
import type { EmptyObject } from '@bemedev/decompose';
import sleep from '@bemedev/sleep';
import type {
  Config,
  ExtractTagsFromConfig,
  GetEventsFromConfig,
  MachineOptions,
  SimpleMachineOptions2,
} from 'src/machine/types2';
import { _unknown } from '#bemedev/globals/utils/_unknown';

type TestArr = readonly [string, () => void];

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
  index: number,
  times?: number,
) => readonly [string, () => Promise<void>];

export const constructWaiter: ConstructWaiter_F = (DELAY = 150) => {
  return (index, times = 1) => {
    const invite = `#${index < 10 ? '0' + index : index} => Wait ${times} times ${DELAY}ms`;

    return tupleOf(invite, () => fakeWaiter(DELAY, times));
  };
};

type _ConstructStateValue_F = (
  value: StateValue,
  index: number,
) => readonly [string, () => void];

type ConstructStateValue_F = (
  service: AnyInterpreter,
) => _ConstructStateValue_F;

export const constructStateValue: ConstructStateValue_F = service => {
  return (value, index) => {
    const _value = JSON.stringify(value);
    const _index = index < 10 ? '0' + index : index;
    const invite = `#${_index} => current value is :${_value}`;

    return tupleOf(invite, () => {
      expect(service.value).toEqual(value);
    });
  };
};

type ConstructContexts_F = <
  const C extends Config = Config,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  E extends EventsMap = GetEventsFromConfig<C>,
  A extends ActorsConfigMap = ActorsConfigMap,
  Mo extends SimpleMachineOptions2 = MachineOptions<C, E, A, Pc, Tc>,
  R = { context: Tc; pContext: Pc },
>(
  service: Interpreter<C, Pc, Tc, E, A, Mo>,
  selector?: (result: { context: Tc; pContext: Pc }) => R,
  name?: string,
) => (index: number, value?: R) => readonly [string, () => void];

export const constructContexts: ConstructContexts_F = (
  service,
  _selector,
  _name,
) => {
  return (index, value) => {
    const isNo = value === undefined || value === null;
    const _defaultSelector = (value: any) => value;
    const selector = _selector ?? _defaultSelector;

    const _value = isNo
      ? 'undefined'
      : JSON.stringify(value).substring(0, 15);

    const _index = index < 10 ? '0' + index : index;
    const name = _name ?? 'context';
    const invite = `#${_index} => ${name} equal : ${_value}`;

    return tupleOf(invite, () => {
      const received = selector({
        context: service.context,
        pContext: service._pContext as any,
      });

      expect(received).toEqual(value);
    });
  };
};

type ConstructSend_F = <
  const C extends Config = Config,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  E extends EventsMap = GetEventsFromConfig<C>,
  A extends ActorsConfigMap = ActorsConfigMap,
  Mo extends SimpleMachineOptions2 = MachineOptions<C, E, A, Pc, Tc>,
>(
  service: Interpreter<C, Pc, Tc, E, A, Mo>,
) => (_event: EventArg<E>, index: number) => readonly [string, () => void];

export const constructSend: ConstructSend_F = service => {
  return (_event, index) => {
    const event = JSON.stringify(_event);
    const _index = index < 10 ? '0' + index : index;
    const invite = `#${_index}=> send ${event}`;

    return tupleOf(invite, () => {
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

type ConstructWaiter2_F = (
  DELAY?: number,
) => (times?: number) => readonly [string, () => Promise<void>];

type ConstructContexts2_F<
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = <R = { context: Tc; pContext: Pc }>(
  selector?: (result: { context: Tc; pContext: Pc }) => R,
  name?: string,
) => (value?: R) => readonly [string, () => void];

type Option<Pc = any, Tc extends PrimitiveObject = PrimitiveObject> = {
  constructWaiter: ConstructWaiter2_F;
  constructContexts: ConstructContexts2_F<Pc, Tc>;
};

type ConstructTestsResult<
  C extends Config = Config,
  E extends EventsMap = GetEventsFromConfig<C>,
  T extends object = object,
> = T &
  Record<
    'start' | 'stop' | 'dispose' | 'pause' | 'resume',
    () => TestArr
  > & {
    send: (_event: EventArg<E>) => TestArr;
    useStateValue: (value: StateValue) => TestArr;
  } & (ExtractTagsFromConfig<C> extends infer Tags
    ? never extends Tags
      ? EmptyObject
      : {
          useTags: (...tags: Tags[]) => TestArr;
        }
    : EmptyObject);

type ConstructTestsResult2 = Record<
  'start' | 'stop' | 'dispose' | 'pause' | 'resume',
  () => TestArr
> & {
  send: (_event: EventObject) => TestArr;
  useStateValue: (value: StateValue) => TestArr;
  useTags: (...tags: string[]) => TestArr;
};

export const constructTests = <
  const C extends Config = Config,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  E extends EventsMap = GetEventsFromConfig<C>,
  A extends ActorsConfigMap = ActorsConfigMap,
  Mo extends SimpleMachineOptions2 = MachineOptions<C, E, A, Pc, Tc>,
  T extends object = object,
>(
  service: Interpreter<C, Pc, Tc, E, A, Mo>,
  helper: (option: Option<Pc, Tc>) => T,
  startIndex = 0,
): ConstructTestsResult<C, E, T> => {
  let index = startIndex;
  const _index = () => {
    const out = index < 10 ? '0' + index : index;
    index++;
    return out;
  };

  const out: ConstructTestsResult2 = {
    ...helper({
      constructWaiter: (DELAY = 150) => {
        return (times = 1) => {
          const invite = `#${_index()} => Wait ${times} times ${DELAY}ms`;

          return tupleOf(invite, () => fakeWaiter(DELAY, times));
        };
      },

      constructContexts: (selector, name) => value => {
        const isNo = value === undefined || value === null;
        const _defaultSelector = (value: any) => value;
        const _selector = selector ?? _defaultSelector;

        const _value = isNo
          ? 'undefined'
          : JSON.stringify(value).substring(0, 15);

        const _name = name ?? 'context';
        const invite = `#${_index()} => ${_name} equal : ${_value}`;

        return tupleOf(invite, () => {
          const received = _selector({
            context: service.context,
            pContext: service._pContext as any,
          });

          expect(received).toEqual(value);
        });
      },
    }),

    useStateValue: value => {
      const _value = JSON.stringify(value);
      const invite = `#${_index()} => current value is :${_value}`;

      return tupleOf(invite, () => {
        expect(service.value).toEqual(value);
      });
    },

    send: _event => {
      const event = JSON.stringify(_event);
      const invite = `#${_index()}=> send ${event}`;

      return tupleOf(invite, () => {
        return service.send(_any(_event));
      });
    },

    start: () => {
      const invite = `#${_index()} => Start the service`;
      return tupleOf(invite, service.start);
    },

    stop: () => {
      const invite = `#${_index()} => Stop the service`;
      return tupleOf(invite, service.stop);
    },

    dispose: () => {
      const invite = `#${_index()} => Dispose the service`;
      return tupleOf(invite, service.stop);
    },

    pause: () => {
      const invite = `#${_index()} => Pause the service`;
      return tupleOf(invite, service.pause);
    },

    resume: () => {
      const invite = `#${_index()} => Resume the service`;
      return tupleOf(invite, service.resume);
    },

    useTags: (...tags) => {
      const invite = `#${_index()} => Tags are : ${tags.join(', ')}`;
      return tupleOf(invite, () => {
        expect(service.tags).toEqual(expect.arrayContaining(tags as any));
      });
    },
  };

  return _unknown<ConstructTestsResult<C, E, T>>(out);
};
