import { t } from '@bemedev/types';
import equal from 'fast-deep-equal';
import {
  constructSend,
  constructValue,
  defaultC,
  defaultT,
  fakeWaiter,
} from 'src/interpreters/__tests__/fixtures';
import { DELAY, fakeDB, machine2 } from '~fixturesData';
import { interpret } from '~interpreters';
import { createMachine, getEntries } from '~machine';
import type { StateValue } from '~states';
import { nothing } from '~utils';

describe('machine coverage', () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  describe('#01 => Integration', () => {
    const TEXT = 'Activities Integration Test from perform';

    describe(TEXT, () => {
      // #region Config

      const service = interpret(machine2, {
        pContext: {
          iterator: 0,
        },
        context: { iterator: 0, input: '', data: [] },
        exact: true,
      });

      const subscriber = service.subscribeMap(
        {
          WRITE: ({
            event: {
              payload: { value },
            },
          }) => console.log('WRITE with', ':', `"${value}"`),
          NEXT: () => console.log('NEXT time, you will see!!'),
          else: nothing,
        },
        {
          equals: (s1, s2) => {
            return equal(s1.event, s2.event);
          },
        },
      );

      const log = vi.spyOn(console, 'log').mockImplementation(() => {});

      beforeAll(() => {
        console.time(TEXT);
      });

      type SE = Parameters<typeof service.send>[0];

      const INPUT = 'a';

      const FAKES = fakeDB.filter(({ name }) => name.includes(INPUT));

      const strings: (string | string[])[] = [];

      // #region Hooks

      const useSend = (event: SE, index: number) => {
        const invite = `#${index < 10 ? '0' + index : index} => Send a "${(event as any).type ?? event}" event`;

        return t.tuple(invite, () => service.send(event));
      };

      const useWrite = (value: string, index: number) => {
        const invite = `#${index < 10 ? '0' + index : index} => Write "${value}"`;

        return t.tuple(invite, () =>
          service.send({ type: 'WRITE', payload: { value } }),
        );
      };

      const useWaiter = (times: number, index: number) => {
        const invite = `#${index < 10 ? '0' + index : index} => Wait ${times} times the delay`;

        return t.tuple(invite, () => fakeWaiter(DELAY, times));
      };

      const useState = (state: StateValue, index: number) => {
        const invite = `#${index < 10 ? '0' + index : index} => Current state is "${state}"`;
        return t.tuple(invite, () => {
          expect(service.value).toStrictEqual(state);
        });
      };

      const useIterator = (num: number, index: number) => {
        const invite = `#${index < 10 ? '0' + index : index} => iterator is "${num}"`;
        return t.tuple(invite, async () => {
          expect(service.select('iterator')).toBe(num);
        });
      };

      const useIteratorC = (num: number, index: number) => {
        const invite = `#${index < 10 ? '0' + index : index} => private iterator is "${num}"`;
        return t.tuple(invite, async () => {
          expect(service._pSelect('iterator')).toBe(num);
        });
      };

      const useInput = (input: string, index: number) => {
        const invite = `#${index < 10 ? '0' + index : index} => input is "${input}"`;
        return t.tuple(invite, async () => {
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

        return t.tuple(invite, func);
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

        return t.tuple(invite, func);
      };
      // #endregion

      // #endregion

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

        test('#02 => All intervals are paused', () => {
          expect(service.intervalsArePaused).toBe(true);
        });

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

        test('#04 => dispose', service[Symbol.asyncDispose].bind(service));
      });
    });
  });

  describe('#02 => Typings', () => {
    const array = [
      '__events',
      '__actionFn',
      '__actionKey',
      '__actionParams',
      '__guard',
      '__predictate',
      '__delayKey',
      '__delay',
      '__definedValue',
      '__src',
      '__promise',
      '__child',
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
    test('#01 => preflat', () => {
      const expected = {
        '/': {
          machines: 'machine1',
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

      expect(machine2.preflat).toStrictEqual(expected);
    });

    test('#02 => postConfig', () => {
      const expected = {
        machines: 'machine1',
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

      expect(machine2.postConfig).toStrictEqual(expected);
    });

    test('#03 => postflat', () => {
      const expected = {
        '/': {
          machines: 'machine1',
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

      expect(machine2.postflat).toStrictEqual(expected);
    });

    test('#04 => initialValue', () => {
      expect(machine2.initialValue).toStrictEqual('idle');
    });
  });

  describe('#04 = > coverage retrieve initial', () => {
    const machine = createMachine(
      {
        states: {
          idle: { on: { NEXT: '/state1' } },
          state1: {
            states: {
              state11: {
                states: {
                  state111: {
                    states: {
                      state1111: {},
                    },
                  },
                },
              },
            },
          },
        },
      },
      { ...defaultT, eventsMap: { NEXT: {} } },
      {
        '/': 'idle',
        '/state1': 'state11',
        '/state1/state11': 'state111',
        '/state1/state11/state111': 'state1111',
      },
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
  });

  test('#05 => getEntries - coverage', () => {
    expect(getEntries()).toStrictEqual([]);
  });

  describe('#06 => machine id is not defined', () => {
    const idM = 'machineNotDefined';
    const machineT = createMachine(
      {
        machines: idM,
        states: {
          idle: {},
        },
      },
      defaultT,
      { '/': 'idle' },
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
});
