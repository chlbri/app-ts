import tupleOf from '#bemedev/features/arrays/castings/tuple';
import _any from '#bemedev/features/common/castings/any';
import type { PrimitiveObject } from '#bemedev/globals/types';
import { _unknown } from '#bemedev/globals/utils/_unknown';
import { expandFn } from '#bemedev/globals/utils/expandFn';
import { DEFAULT_NOTHING } from '#constants';
import type {
  ActorsConfigMap,
  EventArg,
  EventArgT,
  EventObject,
  EventsMap,
  ToEventObject,
  ToEvents,
  ToEventsR,
} from '#events';
import type { Interpreter } from '#interpreter';
import type { StateValue } from '#states';
import { IS_TEST } from '#utils';
import type { EmptyObject } from '@bemedev/decompose';
import { sleep } from '@bemedev/sleep';
import type {
  Config,
  ExtractTagsFromConfig,
  GetEventsFromConfig,
  MachineOptions,
} from '#machines';
import { buildIndex, buildInvite } from './invite';

export * from './constants';
export * from './invite';

type TestArr = readonly [string, () => void];

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

type ConstructStateValue_F = <
  const C extends Config = Config,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  E extends EventsMap = EventsMap,
  A extends ActorsConfigMap = ActorsConfigMap,
>(
  service: Interpreter<C, Pc, Tc, E, A>,
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
  R = { context: Tc; pContext: Pc },
>(
  service: Interpreter<C, Pc, Tc, E, A>,
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
>(
  service: Interpreter<C, Pc, Tc, E, A>,
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
) => (
  times?: number,
  index?: number,
) => readonly [string, () => Promise<void>];

type ConstructContexts2_F<
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = <R = { context: Tc; pContext: Pc }>(
  selector?: (result: { context: Tc; pContext: Pc }) => R,
  name?: string,
) => (value?: R, index?: number) => readonly [string, () => void];

type OptionTupleOf = (
  invite: string,
  assertion: () => any,
) => [string, () => any];

type Option<
  C extends Config = Config,
  E extends EventsMap = GetEventsFromConfig<C>,
  A extends ActorsConfigMap = ActorsConfigMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> = {
  waiter: ConstructWaiter2_F;
  contexts: ConstructContexts2_F<Pc, Tc>;
  index: (_index?: number) => string;
  tupleOf: OptionTupleOf;

  sender: {
    <T extends EventArgT<E>>(
      type: T,
    ): (
      ...data: Extract<
        ToEventsR<E, A>,
        { type: T }
      >['payload'] extends infer P
        ? object extends P
          ? []
          : [payload: P]
        : []
    ) => TestArr;

    index: <T extends EventArgT<E>>(
      type: T,
    ) => (
      ...data: Extract<
        ToEventsR<E, A>,
        { type: T }
      >['payload'] extends infer P
        ? object extends P
          ? [index: number]
          : [index: number, payload: P]
        : [index: number]
    ) => TestArr;
  };
};

type ConstructTestsResult<
  C extends Config = Config,
  E extends EventsMap = GetEventsFromConfig<C>,
  T extends object = object,
> = T &
  Record<
    'start' | 'stop' | 'dispose' | 'pause' | 'resume',
    (index?: number) => TestArr
  > & {
    send: (_event: EventArg<E>, index?: number) => TestArr;
    useStateValue: (value: StateValue, index?: number) => TestArr;
    useWarnings: {
      (...warnings: string[]): TestArr;
      index: (index: number, ...warnings: string[]) => TestArr;
    };
    useErrors: {
      (...warnings: string[]): TestArr;
      index: (index: number, ...warnings: string[]) => TestArr;
    };
  } & (ExtractTagsFromConfig<C> extends infer Tags
    ? string extends Tags
      ? EmptyObject
      : {
          useTags: {
            (...tags: Tags[]): TestArr;
            index: (index: number, ...tags: Tags[]) => TestArr;
          };
        }
    : EmptyObject);

type ConstructTestsResult2 = Record<
  'start' | 'stop' | 'dispose' | 'pause' | 'resume',
  (index?: number) => TestArr
> & {
  send: (_event: EventObject, index?: number) => TestArr;
  useStateValue: (value: StateValue, index?: number) => TestArr;
  useWarnings: {
    (...warnings: string[]): TestArr;
    index: (index: number, ...warnings: string[]) => TestArr;
  };
  useErrors: {
    (...warnings: string[]): TestArr;
    index: (index: number, ...warnings: string[]) => TestArr;
  };
  useTags: {
    (...tags: string[]): TestArr;
    index: (index: number, ...tags: string[]) => TestArr;
  };
};

export const constructTests = <
  const C extends Config = Config,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  const E extends EventsMap = EventsMap,
  const A extends ActorsConfigMap = ActorsConfigMap,
  T extends object = object,
  Eo extends ToEventObject<ToEvents<E, A>> = ToEventObject<ToEvents<E, A>>,
  Ta extends ExtractTagsFromConfig<C> = ExtractTagsFromConfig<C>,
  Mo extends MachineOptions<C, E, A, Pc, Tc, Ta> = MachineOptions<
    C,
    E,
    A,
    Pc,
    Tc,
    Ta
  >,
>(
  service: Interpreter<C, Pc, Tc, E, A, Eo, Ta, Mo>,
  helper?: (option: Option<C, E, A, Pc, Tc>) => T,
  startIndex = 0,
): ConstructTestsResult<C, E, T> => {
  let _index = startIndex;
  const index = (__index?: number) => {
    if (__index !== undefined) return __index + '';
    const out = buildIndex(_index, Math.max(100, _index + 5));
    _index++;
    return out;
  };

  const errorsOrWarnings = (
    type: '_errorsCollector' | '_warningsCollector',
  ) => {
    const str = type === '_errorsCollector' ? 'errors' : 'warnings';
    return expandFn(
      (...warnings: string[]) => {
        const invite = `#${index()} => Expect ${str} : ${warnings.join(', ')}`;
        return tupleOf(invite, () => {
          const cases = warnings.map(
            (warning, index) =>
              [
                buildInvite(
                  `${warning} should be in service.${type}`,
                  index,
                  Math.max(100, warnings.length),
                ),
                warning,
              ] as const,
          );

          test.each([...cases])('%s', (_, warning) => {
            expect(service[type]).toContain(warning);
          });
        });
      },
      {
        index: (_index: number, ...warnings: string[]) => {
          const invite = `#${index(_index)} => Expect ${str} : ${warnings.join(', ')}`;
          return tupleOf(invite, () => {
            const cases = warnings.map(
              (warning, index) =>
                [
                  buildInvite(
                    `${warning} should be in service.${type}`,
                    index + 1,
                    Math.max(100, warnings.length + 1),
                  ),
                  warning,
                ] as const,
            );

            test(
              buildInvite(
                `Length of ${str} should be ${warnings.length}`,
                0,
                Math.max(100, warnings.length + 1),
              ),
              () => {
                expect(service[type]?.values()?.toArray()?.length).toBe(
                  warnings.length,
                );
              },
            );
            test.each([...cases])('%s', (_, warning) => {
              expect(service[type]).toContain(warning);
            });
          });
        },
      },
    );
  };

  const out: ConstructTestsResult2 = {
    ...helper?.({
      tupleOf: (invite, assertion) => [invite, assertion],
      waiter: (DELAY = 150) => {
        return (times = 1, _index) => {
          const invite = `#${index(_index)} => Wait ${times} times ${DELAY}ms`;

          return tupleOf(invite, async () => {
            try {
              await fakeWaiter(DELAY, times);
            } catch {
              // In case of fake timers, this can throw if the timers are not properly handled.
            }
          });
        };
      },

      contexts: (selector, name) => (value, _index) => {
        const isNo = value === undefined || value === null;
        const _defaultSelector = (value: any) => value;
        const _selector = selector ?? _defaultSelector;

        const _value = isNo
          ? 'undefined'
          : JSON.stringify(value).substring(0, 15);

        const _name = name ?? 'context';
        const invite = `#${index(_index)} => ${_name} equal : ${_value}`;

        return tupleOf(invite, () => {
          const received = _selector({
            context: service.context,
            pContext: service._pContext as any,
          });

          expect(received).toEqual(value);
        });
      },

      index,

      sender: expandFn(
        type => {
          return (...___payload: any[]) => {
            const __payload = _any(___payload);
            const data = __payload[0] ?? 'no payload';

            const _payload = JSON.stringify(data).substring(0, 15);
            const invite = `#${index()} => send ${type} event with payload : ${_payload}`;
            const payload = __payload[0] ?? {};
            const event = { type, payload } as EventArg<E>;
            return tupleOf(invite, () => service.send(event));
          };
        },
        {
          index: (type: string) => {
            return (...___payload: any[]) => {
              const __payload = _any(___payload);

              const _payload = JSON.stringify(__payload[1]).substring(
                0,
                15,
              );
              const _index =
                __payload[0] < 10 ? '0' + __payload[0] : __payload[0];
              const invite = `#${index(_index)} => send ${type} event with payload : ${_payload}`;
              const payload = __payload[1] ?? {};
              const event = { type, payload } as EventArg<E>;
              return tupleOf(invite, () => service.send(event));
            };
          },
        },
      ),
    }),

    useWarnings: errorsOrWarnings('_warningsCollector'),
    useErrors: errorsOrWarnings('_errorsCollector'),

    useStateValue: (value, _index) => {
      const _value = JSON.stringify(value);
      const invite = `#${index(_index)} => current value is :${_value}`;

      return tupleOf(invite, () => {
        expect(service.value).toEqual(value);
      });
    },

    send: (_event, _index) => {
      const event = JSON.stringify(_event);
      const invite = `#${index(_index)}=> send ${event}`;

      return tupleOf(invite, () => {
        service.send(_any(_event));
      });
    },

    start: _index => {
      const invite = `#${index(_index)} => Start the service`;
      return tupleOf(invite, service.start);
    },

    stop: _index => {
      const invite = `#${index(_index)} => Stop the service`;
      return tupleOf(invite, service.stop);
    },

    dispose: _index => {
      const invite = `#${index(_index)} => Dispose the service`;
      return tupleOf(invite, service.stop);
    },

    pause: _index => {
      const invite = `#${index(_index)} => Pause the service`;
      return tupleOf(invite, service.pause);
    },

    resume: _index => {
      const invite = `#${index(_index)} => Resume the service`;
      return tupleOf(invite, service.resume);
    },

    useTags: expandFn(
      (...tags) => {
        const invite = `#${index()} => Tags are : ${tags.join(', ')}`;
        return tupleOf(invite, () => {
          expect(service.tags).toEqual(
            expect.arrayContaining(tags as any),
          );
        });
      },
      {
        index: (index: number, ...tags: any[]) => {
          const _index = index < 10 ? '0' + index : index;
          const invite = `#${_index} => Tags are : ${tags.join(', ')}`;
          return tupleOf(invite, () => {
            expect(service.tags).toEqual(
              expect.arrayContaining(tags as any),
            );
          });
        },
      },
    ),
  };

  return _unknown<ConstructTestsResult<C, E, T>>(out);
};
