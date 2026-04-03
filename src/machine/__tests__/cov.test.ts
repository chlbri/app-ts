import tupleOf from '#bemedev/features/arrays/castings/tuple';
import { _machine2, DELAY, fakeDB, machine2 } from '#fixturesData';
import { interpret } from '#interpreters';
import { createMachine, getEntries, Machine } from '#machine';

import { nothing, reduceDescriber } from '#utils';
import { createTests } from '@bemedev/dev-utils/vitest-extended';
import equal from 'fast-deep-equal';
import path from 'path';
import { constructTests, defaultT } from '../../fixtures';

describe('machine coverage', () => {
  beforeAll(() => vi.useFakeTimers());

  describe('#01 => Integration', () => {
    const TEXT = 'Activities Integration Test from perform';
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    beforeAll(() => {
      console.time(TEXT);
      log.mockClear();
    });

    describe(TEXT, () => {
      // #region Config

      const service = interpret(_machine2, {
        context: {
          input: '',
          data: [],
          iterator: 0,
        },

        pContext: { iterator: 0 },
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

      const INPUT = 'a';

      const FAKES = fakeDB
        .filter(({ name }) => name.includes(INPUT))
        .map(({ name }) => name);

      const strings: (string | string[])[] = [];

      // #region Hooks

      const {
        start,
        pause,
        resume,
        send,
        useStateValue,
        useWaiter,
        useWrite,
        useIterator,
        useIteratorC,
        useInput,
        useData,
        useConsole,
      } = constructTests(
        service,
        ({ waiter: _waiter, sender, contexts }) => ({
          useWaiter: _waiter(DELAY),
          useWrite: sender('WRITE'),
          useIterator: contexts(
            ({ context }) => context?.iterator,
            'iterator',
          ),
          useIteratorC: contexts(
            ({ pContext }) => (pContext as any)?.iterator,
            'private iterator',
          ),
          useInput: contexts(({ context }) => context?.input, 'input'),
          useData: (index: number, ...datas: any[]) => {
            const inviteStrict = `#02 => Check strict data`;

            const strict = () => {
              expect(service.context?.data).toStrictEqual(datas);
            };

            const inviteLength = `#01 => Length of data is ${datas.length}`;

            const length = () => {
              expect(service.context?.data?.length).toBe(datas.length);
            };

            const _index = index < 10 ? '0' + index : index;
            const invite = `#${_index} => Check data`;
            const func = () => {
              test(inviteLength, length);
              test(inviteStrict, strict);
            };

            return tupleOf(invite, func);
          },
          useConsole: (
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

            const _index = index < 10 ? '0' + index : index;
            const invite = `#${_index} => Check the console`;
            const func = () => {
              test(inviteLength, length);
              test(inviteStrict, strict);
            };

            return tupleOf(invite, func);
          },
        }),
      );

      // #endregion

      // #endregion

      describe('TESTS', () => {
        test(...start());

        test(...useWaiter(6, 1));

        describe('#02 => Check the service', () => {
          test(...useStateValue('idle', 1));
          test(...useIterator(6, 2));
          test(...useIteratorC(6, 3));
          const array = [
            'Debounced action executed',
            // ...Array(16).fill('nothing call nothing'),
          ];
          describe(...useConsole(4, ...array));
        });

        test(...send('NEXT', 3));

        describe('#05 => Check the service', () => {
          test(
            ...useStateValue(
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
          const array = Array(6).fill('sendPanelToUser');
          describe(...useConsole(3, ...array));
        });

        test(...pause(7));

        describe('#08 => Check the service', () => {
          test(
            ...useStateValue(
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
            ...useStateValue(
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

        test(...resume(11));

        test(...useWaiter(12, 12));

        describe('#13 => Check the service', () => {
          test(
            ...useStateValue(
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
          const array = [
            'sendPanelToUser',
            ...Array(11).fill('sendPanelToUser'),
          ];
          describe(...useConsole(4, ...array));
        });

        test(...useWrite({ value: '' }));

        describe('#15 => Check the service', () => {
          test(
            ...useStateValue(
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
            ...useStateValue(
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
          const array = [
            'sendPanelToUser',
            'Input, please !!',
            ...Array(11)
              .fill(['sendPanelToUser', 'Input, please !!'])
              .flat(),
          ];

          describe(...useConsole(5, ...array));
        });

        test(...useWrite({ value: INPUT }));

        describe('#19 => Check the service', () => {
          test(
            ...useStateValue(
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
          describe(...useConsole(5, ['WRITE with', ':', `"${INPUT}"`]));
        });

        test(...useWaiter(12, 20));

        describe('#21 => Check the service', () => {
          test(
            ...useStateValue(
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

        test(...useWrite({ value: INPUT }));

        describe('#24 => Check the service', () => {
          test(
            ...useStateValue(
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
            ...useStateValue(
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

        test(...send('FETCH', 27));

        describe('#28 => Check the service', () => {
          test(
            ...useStateValue(
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

        test(...useWaiter(0, 29));

        describe('#30 => Check the service', () => {
          test(
            ...useStateValue(
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
            ...useStateValue(
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
          test(...pause(1));

          describe('#02 => Calls of log', () => {
            test('#01 => Length of calls of log is the same of length of strings', () => {
              expect(log).toBeCalledTimes(strings.length);
            });

            test('#02 => Log is called "70" times', () => {
              expect(log).toBeCalledTimes(70);
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
      '__config',
      '__eventsO',
      '__childKey',
      '__tag',
      '__actionParams',
      '__stateExtended',
      '__state',
      '__decomposedState',
      '__stateP',
      '__statePextended',
      '__guardKey',
      '__predicate',
      '__delayKey',
      '__delay',
      '__definedValue',
      '__src',
      '__promise',
      '__machine',
    ] as const satisfies (keyof Machine)[];

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
        actors: {
          machine1: {
            contexts: {
              iterator: 'iterator',
            },
            on: {},
          },
        },
        initial: 'idle',
        states: {
          final: {},
          idle: {
            activities: {
              DELAY: 'inc',
            },
            on: {
              NEXT: '/working',
            },
          },
          working: {
            activities: {
              DELAY2: 'inc2',
            },
            on: {
              FINISH: '/final',
            },
            states: {
              fetch: {
                initial: 'idle',
                states: {
                  fetch: {
                    actors: {
                      fetch: {
                        catch: '/working/fetch/idle',
                        // oxlint-disable-next-line unicorn/no-thenable
                        then: {
                          actions: {
                            description: 'Database insert',
                            name: 'insertData',
                          },
                          target: '/working/fetch/idle',
                        },
                      },
                    },
                  },
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
                },
              },
              ui: {
                initial: 'idle',
                states: {
                  final: {},
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
                        actions: 'askUsertoInput',
                        guards: 'isInputEmpty',
                      },
                    },
                    on: {
                      WRITE: [
                        {
                          actions: 'write',
                          guards: 'isInputNotEmpty',
                          target: '/working/ui/idle',
                        },
                        '/working/ui/idle',
                      ],
                    },
                  },
                },
              },
            },
            type: 'parallel',
          },
        },
      };

      expect(machine2.config).toStrictEqual(expected);
    });

    test('#02 => flat', () => {
      const expected = {
        '/': {
          actors: {
            machine1: {
              contexts: {
                iterator: 'iterator',
              },
              on: {},
            },
          },
          initial: 'idle',
          states: {
            final: {},
            idle: {
              activities: {
                DELAY: 'inc',
              },
              on: {
                NEXT: '/working',
              },
            },
            working: {
              activities: {
                DELAY2: 'inc2',
              },
              on: {
                FINISH: '/final',
              },
              states: {
                fetch: {
                  initial: 'idle',
                  states: {
                    fetch: {
                      actors: {
                        fetch: {
                          catch: '/working/fetch/idle',
                          // oxlint-disable-next-line unicorn/no-thenable
                          then: {
                            actions: {
                              name: 'insertData',
                              description: 'Database insert',
                            },
                            target: '/working/fetch/idle',
                          },
                        },
                      },
                    },
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
                  },
                },
                ui: {
                  initial: 'idle',
                  states: {
                    final: {},
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
                          actions: 'askUsertoInput',
                          guards: 'isInputEmpty',
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
                  },
                },
              },
              type: 'parallel',
            },
          },
        },

        '/final': {},

        '/idle': {
          activities: { DELAY: 'inc' },
          on: {
            NEXT: '/working',
          },
        },
        '/working': {
          activities: { DELAY2: 'inc2' },
          on: {
            FINISH: '/final',
          },
          states: {
            fetch: {
              initial: 'idle',
              states: {
                fetch: {
                  actors: {
                    fetch: {
                      catch: '/working/fetch/idle',
                      // oxlint-disable-next-line unicorn/no-thenable
                      then: {
                        actions: {
                          name: 'insertData',
                          description: 'Database insert',
                        },
                        target: '/working/fetch/idle',
                      },
                    },
                  },
                },
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
              },
            },
            ui: {
              initial: 'idle',
              states: {
                final: {},
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
                      actions: 'askUsertoInput',
                      guards: 'isInputEmpty',
                    },
                  },
                  on: {
                    WRITE: [
                      {
                        actions: 'write',
                        guards: 'isInputNotEmpty',
                        target: '/working/ui/idle',
                      },
                      '/working/ui/idle',
                    ],
                  },
                },
              },
            },
          },
          type: 'parallel',
        },

        '/working/fetch': {
          initial: 'idle',
          states: {
            fetch: {
              actors: {
                fetch: {
                  catch: '/working/fetch/idle',
                  // oxlint-disable-next-line unicorn/no-thenable
                  then: {
                    actions: {
                      name: 'insertData',
                      description: 'Database insert',
                    },
                    target: '/working/fetch/idle',
                  },
                },
              },
            },
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
          },
        },

        '/working/fetch/fetch': {
          actors: {
            fetch: {
              catch: '/working/fetch/idle',
              // oxlint-disable-next-line unicorn/no-thenable
              then: {
                actions: {
                  name: 'insertData',
                  description: 'Database insert',
                },
                target: '/working/fetch/idle',
              },
            },
          },
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

        '/working/ui': {
          initial: 'idle',
          states: {
            final: {},
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
                  actions: 'askUsertoInput',
                  guards: 'isInputEmpty',
                },
              },
              on: {
                WRITE: [
                  {
                    actions: 'write',
                    guards: 'isInputNotEmpty',
                    target: '/working/ui/idle',
                  },
                  '/working/ui/idle',
                ],
              },
            },
          },
        },

        '/working/ui/final': {},

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
              actions: 'askUsertoInput',
              guards: 'isInputEmpty',
            },
          },
          on: {
            WRITE: [
              {
                actions: 'write',
                guards: 'isInputNotEmpty',
                target: '/working/ui/idle',
              },
              '/working/ui/idle',
            ],
          },
        },
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

    const service = interpret(machine);
    const { useStateValue, start, send } = constructTests(service);
    test(...start());
    test(...useStateValue('idle'));
    test(...send('NEXT'));

    test(
      ...useStateValue(
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
          initial: 'idle',
          states: {
            idle: {},
          },
          actors: {
            [idM]: {
              on: {},
            },
          },
        },
        defaultT as any,
        // defaultI,
      );

      const service = interpret(machineT);
      const { start } = constructTests(service);

      test(...start(0));

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
          initial: 'idle',
          states: {
            idle: {},
          },
          actors: {
            [idM.name]: {
              description: idM.description,
              on: {},
            },
          },
        },
        defaultT as any,
        // defaultI,
      );

      const service = interpret(machineT);

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

          test(`#02 => contains warning for machine : "${reduceDescriber(idM)}"`, () => {
            const expected = `Machine (${reduceDescriber(idM)}) is not defined`;
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
