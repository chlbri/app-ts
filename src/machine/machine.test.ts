import { reduceAction } from '#actions';
import { DELAY, fakeDB, machine2 } from '#fixturesData';
import { interpret } from '#interpreters';
import { createMachine, getEntries } from '#machine';
import type { StateValue } from '#states';
import { nothing } from '#utils';
import { castings } from '@bemedev/types';
import { createTests } from '@bemedev/vitest-extended';
import equal from 'fast-deep-equal';
import path from 'path';
import {
  constructSend,
  constructValue,
  defaultC,
  defaultT,
  fakeWaiter,
} from '../interpreters/__tests__/fixtures';

describe('machine coverage', () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  describe('#01 => Integration', () => {
    const TEXT = 'Activities Integration Test from perform';
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    beforeAll(() => {
      console.time(TEXT);
      log.mockClear();
    });
    describe(TEXT, () => {
      // #region Config

      const service = interpret(machine2, {
        pContext: {
          iterator: 0,
        },
        context: { iterator: 0, input: '', data: [] },
        exact: true,
      });

      const subscriber = service.subscribe(
        {
          WRITE: ({ payload: { value } }) =>
            console.log('WRITE with', ':', `"${value}"`),
          NEXT: () => console.log('NEXT time, you will see!!'),
          else: nothing,
        },
        {
          equals: (s1, s2) => {
            return equal(s1.event, s2.event);
          },
        },
      );

      type SE = Parameters<typeof service.send>[0];

      const INPUT = 'a';

      const FAKES = fakeDB.filter(({ name }) => name.includes(INPUT));

      const strings: (string | string[])[] = [];

      // #region Hooks

      const useSend = (event: SE, index: number) => {
        const invite = `#${index < 10 ? '0' + index : index} => Send a "${(event as any).type ?? event}" event`;

        return castings.arrays.tupleOf(invite, () => service.send(event));
      };

      const useWrite = (value: string, index: number) => {
        const invite = `#${index < 10 ? '0' + index : index} => Write "${value}"`;

        return castings.arrays.tupleOf(invite, () =>
          service.send({ type: 'WRITE', payload: { value } }),
        );
      };

      const useWaiter = (times: number, index: number) => {
        const invite = `#${index < 10 ? '0' + index : index} => Wait ${times} times the delay`;

        return castings.arrays.tupleOf(invite, () =>
          fakeWaiter(DELAY, times),
        );
      };

      const useState = (state: StateValue, index: number) => {
        const invite = `#${index < 10 ? '0' + index : index} => Current state is "${state}"`;
        return castings.arrays.tupleOf(invite, () => {
          expect(service.state.value).toStrictEqual(state);
        });
      };

      const useIterator = (num: number, index: number) => {
        const invite = `#${index < 10 ? '0' + index : index} => iterator is "${num}"`;
        return castings.arrays.tupleOf(invite, async () => {
          expect(service.select('iterator')).toBe(num);
        });
      };

      const useIteratorC = (num: number, index: number) => {
        const invite = `#${index < 10 ? '0' + index : index} => private iterator is "${num}"`;
        return castings.arrays.tupleOf(invite, async () => {
          expect(service._pSelect('iterator')).toBe(num);
        });
      };

      const useInput = (input: string, index: number) => {
        const invite = `#${index < 10 ? '0' + index : index} => input is "${input}"`;
        return castings.arrays.tupleOf(invite, async () => {
          expect(service.context.input).toBe(input);
        });
      };

      const useData = (index: number, ...datas: any[]) => {
        const inviteStrict = `#02 => Check strict data`;

        const strict = () => {
          expect(service.context.data).toStrictEqual(datas);
        };

        const inviteLength = `#01 => Length of data is ${datas.length}`;

        const length = () => {
          expect(service.context.data.length).toBe(datas.length);
        };

        const invite = `#${index < 10 ? '0' + index : index} => Check data`;
        const func = () => {
          test(inviteLength, length);
          test(inviteStrict, strict);
        };

        return castings.arrays.tupleOf(invite, func);
      };

      const useConsole = (
        index: number,
        ..._strings: (string | string[])[]
      ) => {
        const inviteStrict = `#02 => Check strict string`;

        const strict = () => {
          const calls = strings.map(data => [data].flat());
          expect(log.mock.calls).toStrictEqual(calls);
        };

        const inviteLength = `#01 => Length of calls is : ${_strings.length}`;

        const length = () => {
          strings.push(..._strings);
          expect(log.mock.calls.length).toBe(strings.length);
        };

        const invite = `#${index < 10 ? '0' + index : index} => Check the console`;
        const func = () => {
          test(inviteLength, length);
          test(inviteStrict, strict);
        };

        return castings.arrays.tupleOf(invite, func);
      };
      // #endregion

      // #endregion

      describe('TESTS', () => {
        test('#00 => Start the machine', () => {
          service.start();
        });

        test(...useWaiter(6, 1));

        describe('#02 => Check the service', () => {
          test(...useState('idle', 1));
          test(...useIterator(6, 2));
          test(...useIteratorC(6, 3));
          describe(...useConsole(4));
        });

        test(...useSend('NEXT', 3));

        describe('#05 => Check the service', () => {
          test(
            ...useState(
              {
                working: {
                  fetch: 'idle',
                  ui: 'idle',
                },
              },
              1,
            ),
          );

          test(...useIterator(6, 2));
          test(...useIteratorC(6, 3));

          describe(...useConsole(4, 'NEXT time, you will see!!'));
        });

        test(...useWaiter(6, 5));

        describe('#06 => Check the service', () => {
          test(...useIterator(18, 1));
          test(...useIteratorC(12, 2));
          describe(...useConsole(3, ...Array(6).fill('sendPanelToUser')));
        });

        test('#07 => pause', service.pause.bind(service));

        describe('#08 => Check the service', () => {
          test(
            ...useState(
              {
                working: {
                  fetch: 'idle',
                  ui: 'idle',
                },
              },
              1,
            ),
          );

          test(...useIterator(18, 2));
          test(...useIteratorC(12, 3));

          describe(...useConsole(4));
        });

        test(...useWaiter(6, 9));

        describe('#10 => Check the service', () => {
          test(
            ...useState(
              {
                working: {
                  fetch: 'idle',
                  ui: 'idle',
                },
              },
              1,
            ),
          );

          test(...useIterator(18, 2));
          test(...useIteratorC(12, 3));

          describe(...useConsole(4));
        });

        test('#11 => resume', service.resume.bind(service));

        test(...useWaiter(12, 12));

        describe('#13 => Check the service', () => {
          test(
            ...useState(
              {
                working: {
                  fetch: 'idle',
                  ui: 'idle',
                },
              },
              1,
            ),
          );

          test(...useIterator(42, 2));
          test(...useIteratorC(24, 3));

          describe(...useConsole(4, ...Array(12).fill('sendPanelToUser')));
        });

        test(...useWrite('', 14));

        describe('#15 => Check the service', () => {
          test(
            ...useState(
              {
                working: {
                  fetch: 'idle',
                  ui: 'input',
                },
              },
              1,
            ),
          );

          test(...useIterator(42, 2));
          test(...useIteratorC(24, 3));
          test(...useInput('', 4));
          describe(...useConsole(5, ['WRITE with', ':', '""']));
        });

        test(...useWaiter(12, 16));

        describe('#17 => Check the service', () => {
          test(
            ...useState(
              {
                working: {
                  fetch: 'idle',
                  ui: 'input',
                },
              },
              1,
            ),
          );

          test(...useIterator(66, 2));
          test(...useIteratorC(36, 3));
          test(...useInput('', 4));

          describe(
            ...useConsole(
              5,
              ...Array(24)
                .fill(0)
                .map((_, index) => {
                  const isEven = index % 2 === 0;
                  return isEven ? 'sendPanelToUser' : 'Input, please !!';
                }),
            ),
          );
        });

        test(...useWrite(INPUT, 18));

        describe('#19 => Check the service', () => {
          test(
            ...useState(
              {
                working: {
                  fetch: 'idle',
                  ui: 'idle',
                },
              },
              1,
            ),
          );

          test(...useIterator(66, 2));
          test(...useIteratorC(36, 3));
          test(...useInput('', 4));
          describe(
            ...useConsole(
              5,

              ['WRITE with', ':', `"${INPUT}"`],
            ),
          );
        });

        test(...useWaiter(12, 20));

        describe('#21 => Check the service', () => {
          test(
            ...useState(
              {
                working: {
                  fetch: 'idle',
                  ui: 'idle',
                },
              },
              1,
            ),
          );

          test(...useIterator(90, 2));
          test(...useIteratorC(48, 3));
          test(...useInput('', 4));
          describe(...useConsole(5, ...Array(12).fill('sendPanelToUser')));
        });

        test(
          '#22 => Close the subscriber',
          subscriber.close.bind(subscriber),
        );

        test(...useWrite(INPUT, 23));

        describe('#24 => Check the service', () => {
          test(
            ...useState(
              {
                working: {
                  fetch: 'idle',
                  ui: 'input',
                },
              },
              1,
            ),
          );

          test(...useIterator(90, 2));
          test(...useIteratorC(48, 3));
          test(...useInput(INPUT, 4));
          describe(...useConsole(5));
        });

        test(...useWaiter(6, 25));

        describe('#26 => Check the service', () => {
          test(
            ...useState(
              {
                working: {
                  fetch: 'idle',
                  ui: 'input',
                },
              },
              1,
            ),
          );

          test(...useIterator(102, 2));
          test(...useIteratorC(54, 3));
          test(...useInput(INPUT, 4));
          describe(...useData(5));
          describe(...useConsole(6, ...Array(6).fill('sendPanelToUser')));
        });

        test(...useSend('FETCH', 27));

        describe('#28 => Check the service', () => {
          test(
            ...useState(
              {
                working: {
                  fetch: 'idle',
                  ui: 'input',
                },
              },
              1,
            ),
          );

          test(...useIterator(102, 2));
          test(...useIteratorC(54, 3));
          test(...useInput(INPUT, 4));
          describe(...useData(5, ...FAKES));
          describe(...useConsole(6));
        });

        test('#29 => Await the fetch', () => fakeWaiter());

        describe('#30 => Check the service', () => {
          test(
            ...useState(
              {
                working: {
                  fetch: 'idle',
                  ui: 'input',
                },
              },
              1,
            ),
          );

          test(...useIterator(102, 2));
          test(...useIteratorC(54, 3));
          test(...useInput(INPUT, 4));
          describe(...useData(5, ...FAKES));
          describe(...useConsole(5));
        });

        test(...useWaiter(6, 31));

        describe('#32 => Check the service', () => {
          test(
            ...useState(
              {
                working: {
                  fetch: 'idle',
                  ui: 'input',
                },
              },
              1,
            ),
          );

          test(...useIterator(114, 2));
          test(...useIteratorC(60, 3));
          test(...useInput(INPUT, 4));
          describe(...useData(5, ...FAKES));
          describe(...useConsole(6, ...Array(6).fill('sendPanelToUser')));
        });

        describe('#33 => Close the service', async () => {
          test('#01 => Pause the service', service.pause.bind(service));

          describe('#02 => Calls of log', () => {
            test('#01 => Length of calls of log is the same of length of strings', () => {
              expect(log).toBeCalledTimes(strings.length);
            });

            test('#02 => Log is called "78" times', () => {
              expect(log).toBeCalledTimes(69);
            });
          });

          test('#03 => Log the time of all tests', () => {
            console.timeEnd(TEXT);
          });

          test(
            '#04 => dispose',
            service[Symbol.asyncDispose].bind(service),
          );
        });
      });
    });
  });

  describe('#02 => Typings', () => {
    const array = [
      '__events',
      '__actionFn',
      '__actionKey',
      '__actionParams',
      '__stateExtended',
      '__state',
      '__stateP',
      '__statePextended',
      '__guardKey',
      '__predictate',
      '__delayKey',
      '__delay',
      '__definedValue',
      '__src',
      '__promise',
      '__childKey',
      '__machine',
    ] as const;

    array.forEach((key, index) => {
      const invite = `#${index < 10 ? '0' + index : index} => ${key}`;
      test(invite, () => {
        expect(machine2[key]).toBeUndefined();
      });
    });
  });

  describe('#03 => Getters', () => {
    test('#01 => config', () => {
      const expected = {
        machines: { machine1: 'machine1' },
        initial: 'idle',
        states: {
          idle: {
            activities: {
              DELAY: 'inc',
            },
            on: {
              NEXT: '/working',
            },
          },
          working: {
            type: 'parallel',
            activities: {
              DELAY2: 'inc2',
            },
            on: {
              FINISH: '/final',
            },
            states: {
              fetch: {
                states: {
                  idle: {
                    activities: {
                      DELAY: 'sendPanelToUser',
                    },
                    on: {
                      FETCH: {
                        guards: 'isInputNotEmpty',
                        target: '/working/fetch/fetch',
                      },
                    },
                  },
                  fetch: {
                    promises: {
                      src: 'fetch',
                      then: {
                        actions: {
                          name: 'insertData',
                          description: 'Database insert',
                        },
                        target: '/working/fetch/idle',
                      },
                      catch: '/working/fetch/idle',
                    },
                  },
                },
                initial: 'idle',
              },
              ui: {
                states: {
                  idle: {
                    on: {
                      WRITE: {
                        actions: 'write',
                        target: '/working/ui/input',
                      },
                    },
                  },
                  input: {
                    activities: {
                      DELAY: {
                        guards: 'isInputEmpty',
                        actions: 'askUsertoInput',
                      },
                    },
                    on: {
                      WRITE: [
                        {
                          guards: 'isInputNotEmpty',
                          actions: 'write',
                          target: '/working/ui/idle',
                        },
                        '/working/ui/idle',
                      ],
                    },
                  },
                  final: {},
                },
                initial: 'idle',
              },
            },
          },
          final: {},
        },
      };

      expect(machine2.config).toStrictEqual(expected);
    });

    test('#02 => flat', () => {
      const expected = {
        '/': {
          machines: { machine1: 'machine1' },
          initial: 'idle',
          states: {
            idle: {
              activities: {
                DELAY: 'inc',
              },
              on: {
                NEXT: '/working',
              },
            },
            working: {
              type: 'parallel',
              activities: {
                DELAY2: 'inc2',
              },
              on: {
                FINISH: '/final',
              },
              states: {
                fetch: {
                  states: {
                    idle: {
                      activities: {
                        DELAY: 'sendPanelToUser',
                      },
                      on: {
                        FETCH: {
                          guards: 'isInputNotEmpty',
                          target: '/working/fetch/fetch',
                        },
                      },
                    },
                    fetch: {
                      promises: {
                        src: 'fetch',
                        then: {
                          actions: {
                            name: 'insertData',
                            description: 'Database insert',
                          },
                          target: '/working/fetch/idle',
                        },
                        catch: '/working/fetch/idle',
                      },
                    },
                  },
                  initial: 'idle',
                },
                ui: {
                  states: {
                    idle: {
                      on: {
                        WRITE: {
                          actions: 'write',
                          target: '/working/ui/input',
                        },
                      },
                    },
                    input: {
                      activities: {
                        DELAY: {
                          guards: 'isInputEmpty',
                          actions: 'askUsertoInput',
                        },
                      },
                      on: {
                        WRITE: [
                          {
                            guards: 'isInputNotEmpty',
                            actions: 'write',
                            target: '/working/ui/idle',
                          },
                          '/working/ui/idle',
                        ],
                      },
                    },
                    final: {},
                  },
                  initial: 'idle',
                },
              },
            },
            final: {},
          },
        },
        '/idle': {
          activities: {
            DELAY: 'inc',
          },
          on: {
            NEXT: '/working',
          },
        },
        '/working': {
          type: 'parallel',
          activities: {
            DELAY2: 'inc2',
          },
          on: {
            FINISH: '/final',
          },
          states: {
            fetch: {
              states: {
                idle: {
                  activities: {
                    DELAY: 'sendPanelToUser',
                  },
                  on: {
                    FETCH: {
                      guards: 'isInputNotEmpty',
                      target: '/working/fetch/fetch',
                    },
                  },
                },
                fetch: {
                  promises: {
                    src: 'fetch',
                    then: {
                      actions: {
                        name: 'insertData',
                        description: 'Database insert',
                      },
                      target: '/working/fetch/idle',
                    },
                    catch: '/working/fetch/idle',
                  },
                },
              },
              initial: 'idle',
            },
            ui: {
              states: {
                idle: {
                  on: {
                    WRITE: {
                      actions: 'write',
                      target: '/working/ui/input',
                    },
                  },
                },
                input: {
                  activities: {
                    DELAY: {
                      guards: 'isInputEmpty',
                      actions: 'askUsertoInput',
                    },
                  },
                  on: {
                    WRITE: [
                      {
                        guards: 'isInputNotEmpty',
                        actions: 'write',
                        target: '/working/ui/idle',
                      },
                      '/working/ui/idle',
                    ],
                  },
                },
                final: {},
              },
              initial: 'idle',
            },
          },
        },
        '/working/fetch': {
          states: {
            idle: {
              activities: {
                DELAY: 'sendPanelToUser',
              },
              on: {
                FETCH: {
                  guards: 'isInputNotEmpty',
                  target: '/working/fetch/fetch',
                },
              },
            },
            fetch: {
              promises: {
                src: 'fetch',
                then: {
                  actions: {
                    name: 'insertData',
                    description: 'Database insert',
                  },
                  target: '/working/fetch/idle',
                },
                catch: '/working/fetch/idle',
              },
            },
          },
          initial: 'idle',
        },
        '/working/fetch/idle': {
          activities: {
            DELAY: 'sendPanelToUser',
          },
          on: {
            FETCH: {
              guards: 'isInputNotEmpty',
              target: '/working/fetch/fetch',
            },
          },
        },
        '/working/fetch/fetch': {
          promises: {
            src: 'fetch',
            then: {
              actions: {
                name: 'insertData',
                description: 'Database insert',
              },
              target: '/working/fetch/idle',
            },
            catch: '/working/fetch/idle',
          },
        },
        '/working/ui': {
          states: {
            idle: {
              on: {
                WRITE: {
                  actions: 'write',
                  target: '/working/ui/input',
                },
              },
            },
            input: {
              activities: {
                DELAY: {
                  guards: 'isInputEmpty',
                  actions: 'askUsertoInput',
                },
              },
              on: {
                WRITE: [
                  {
                    guards: 'isInputNotEmpty',
                    actions: 'write',
                    target: '/working/ui/idle',
                  },
                  '/working/ui/idle',
                ],
              },
            },
            final: {},
          },
          initial: 'idle',
        },
        '/working/ui/idle': {
          on: {
            WRITE: {
              actions: 'write',
              target: '/working/ui/input',
            },
          },
        },
        '/working/ui/input': {
          activities: {
            DELAY: {
              guards: 'isInputEmpty',
              actions: 'askUsertoInput',
            },
          },
          on: {
            WRITE: [
              {
                guards: 'isInputNotEmpty',
                actions: 'write',
                target: '/working/ui/idle',
              },
              '/working/ui/idle',
            ],
          },
        },
        '/working/ui/final': {},
        '/final': {},
      };

      expect(machine2.flat).toStrictEqual(expected);
    });

    test('#03 => initialValue', () => {
      expect(machine2.initialValue).toStrictEqual('idle');
    });
  });

  describe('#04 = > coverage retrieve initial', () => {
    const machine = createMachine(
      {
        initial: 'idle',
        states: {
          idle: {
            on: {
              NEXT: '/state1',
            },
          },
          state1: {
            activities: { DELAY: 'inc' },
            initial: 'state11',
            states: {
              state11: {
                initial: 'state111',
                states: {
                  state111: {
                    initial: 'state1111',
                    states: {
                      state1111: {},
                    },
                  },
                  state112: {},
                },
              },
            },
          },
        },
      },
      { ...defaultT, eventsMap: { NEXT: {} } },
    );

    const service = interpret(machine, defaultC);
    const useValue = constructValue(service);
    const useSendNEXT = (index: number) => {
      const func = constructSend(service);
      return func('NEXT', index);
    };

    test('#01 => start the service', () => {
      service.start();
    });

    test(...useValue('idle', 1));

    test(...useSendNEXT(2));

    test(
      ...useValue(
        {
          state1: {
            state11: {
              state111: 'state1111',
            },
          },
        },
        3,
      ),
    );

    describe('#04 => Cover machine.retrieveParentFromInitial', () => {
      const { acceptation, success } = createTests(
        machine.retrieveParentFromInitial,
      );

      describe('#00 => Acceptation', acceptation);

      const state1 = {
        activities: {
          DELAY: 'inc',
        },
        states: {
          state11: {
            states: {
              state111: {
                states: {
                  state1111: {},
                },
                initial: 'state1111',
              },
              state112: {},
            },
            initial: 'state111',
          },
        },
        initial: 'state11',
      };

      describe(
        '#01 => Success',
        success(
          {
            invite: 'For /idle',
            expected: {
              on: { NEXT: '/state1' },
            },
            parameters: '/idle',
          },
          {
            invite: 'For /state1',
            expected: state1,
            parameters: '/state1',
          },
          {
            invite: 'For /state1/state11',
            expected: state1,
            parameters: '/state1/state11',
          },
          {
            invite: 'For /state1/state11/state111',
            expected: state1,
            parameters: '/state1/state11/state111',
          },
          {
            invite: 'For /state1/state11/state111/state1111',
            expected: state1,
            parameters: '/state1/state11/state111/state1111',
          },
          {
            invite: 'For /state1/state11/state112',
            expected: {},
            parameters: '/state1/state11/state112',
          },
          {
            invite: 'For /not exits',
            expected: undefined as any,
            parameters: '/not exists',
          },
        ),
      );

      test('Debug', () => {
        console.log(
          'value',
          JSON.stringify(
            machine.retrieveParentFromInitial('/state1/state11/state111'),
            null,
            2,
          ),
        );
      });
    });
  });

  test('#05 => getEntries - coverage', () => {
    expect(getEntries()).toStrictEqual([]);
  });

  describe('#06 => machine id is not defined', () => {
    describe('#01 => string', () => {
      const idM = 'machineNotDefined';
      const machineT = createMachine(
        {
          machines: { idM },
          initial: 'idle',
          states: {
            idle: {},
          },
        },
        defaultT,
        // defaultI,
      );

      const service = interpret(machineT, defaultC);

      test('#00 => start', service.start.bind(service));

      describe('#01 => log', () => {
        test('#01 => errors is empty', () => {
          const actual = service._errorsCollector;
          expect(actual).toHaveLength(0);
        });

        describe('#02 => It has some watnings', () => {
          test('#01 => warnings is not empty', () => {
            const actual = service._warningsCollector;
            expect(actual).not.toHaveLength(0);
            expect(actual).toHaveLength(1);
          });

          test(`#02 => contains warning for machine : "${idM}"`, () => {
            const expected = `Machine (${idM}) is not defined`;
            expect(service._warningsCollector).toContain(expected);
          });
        });
      });
    });

    describe('#01 => object', () => {
      const idM = {
        name: 'machineNotDefined',
        description: 'Not defined',
      };
      const machineT = createMachine(
        {
          machines: { idM },
          initial: 'idle',
          states: {
            idle: {},
          },
        },
        defaultT,
        // defaultI,
      );

      const service = interpret(machineT, defaultC);

      test('#00 => start', service.start.bind(service));

      describe('#01 => log', () => {
        test('#01 => errors is empty', () => {
          const actual = service._errorsCollector;
          expect(actual).toHaveLength(0);
        });

        describe('#02 => It has some watnings', () => {
          test('#01 => warnings is not empty', () => {
            const actual = service._warningsCollector;
            expect(actual).not.toHaveLength(0);
            expect(actual).toHaveLength(1);
          });

          test(`#02 => contains warning for machine : "${reduceAction(idM)}"`, () => {
            const expected = `Machine (${reduceAction(idM)}) is not defined`;
            expect(service._warningsCollector).toContain(expected);
          });
        });
      });
    });
  });
});

test('#my', () => {
  console.warn(
    path.resolve(
      '/parent/child/grandchild/grantchild',
      '../../grandchild',
    ),
  );
});
