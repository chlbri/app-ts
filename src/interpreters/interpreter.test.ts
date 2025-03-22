import { t } from '@bemedev/types';
import { createFakeWaiter } from '@bemedev/vitest-extended';
import { MAX_SELF_TRANSITIONS, MIN_ACTIVITY_TIME } from '~constants';
import { DELAY, fakeDB, machine1 } from '~fixturesData';
import { createMachine } from '~machine';
import { EVENTS_FULL } from '~machines';
import type { StateValue } from '~states';
import { nothing, toFunction } from '~utils';
import { machine21 } from './__tests__/data/machine21';
import { machine3 } from './__tests__/data/machine3';
import { defaultC, defaultT, fakeWaiter } from './__tests__/fixtures';
import { interpret, TIME_TO_RINIT_SELF_COUNTER } from './interpreter';
import type { AnyInterpreter } from './interpreter.types';

beforeAll(() => {
  vi.useFakeTimers();
});

describe('Interpreter', () => {
  const resultC = {
    pContext: { data: 'avion' },
    context: { age: 5 },
  };

  describe('#01 => Status', () => {
    let service = t.unknown<AnyInterpreter>();

    test('#0 => Create the machine', () => {
      service = t.any(interpret(machine3, resultC));
    });

    test('#1 => The machine is at "status: idle"', () => {
      const actual = service.status;
      expect(actual).toBe('starting');
    });

    test('#2 => Start the machine', () => {
      service.start();
    });

    describe('#3 => The machine can start', () => {
      test('#1 => The machine is at "status: working"', () => {
        const actual = service.status;
        expect(actual).toBe('working');
      });

      describe('#2 => Check the currentvalue', () => {
        const expected = {
          state1: {
            state11: 'state111',
          },
        };

        test("#1 => It's expected", () => {
          const actual = service.value;
          expect(actual).toStrictEqual(expected);
        });

        test("#2 => It's the same as the initial", () => {
          expect(service.initialValue).toStrictEqual(service.value);
        });
      });
    });
  });

  describe('#02 => Can check without starting', () => {
    const service = interpret(machine3, {
      ...resultC,
    }).renew;

    describe('#01 => Mode', () => {
      test('#01 => mode is ""strict" by default', () => {
        expect(service.isStrict).toBe(true);
      });

      test('#02 => Make it normal', () => {
        service.makeNormal();
      });

      test('#03 => mode is "normal"', () => {
        expect(service.isNormal).toBe(true);
        expect(service.mode).toBe('normal');
      });

      test('#04 => Make it "strictest"', () => {
        service.makeStrictest();
      });

      test('#05 => modde is "strictest"', () => {
        expect(service.isStrictest).toBe(true);
      });

      test('#06 => Remake it "strict"', () => {
        service.makeStrict();
      });

      test('#07 => modde is "strict"', () => {
        expect(service.isStrict).toBe(true);
      });
    });

    test('#02 => Events Map', () => {
      expect(service.eventsMap).toStrictEqual({
        EVENT: { password: t.string, username: t.string },
        EVENT2: t.boolean,
        EVENT3: { login: t.string, pwd: t.string },
      });
    });

    test('#03 => Cannot use scheduler before starting', () => {
      expect(service.scheduleds).toBe(0);
    });

    describe('#04 => nodes', () => {
      const node = {
        after: [],
        always: [],
        description: 'cdd',
        entry: [],
        exit: [],
        initial: 'state1',
        on: [],
        promises: [],
        states: [
          {
            __id: 'state1',
            after: [],
            always: [],
            entry: [],
            exit: [],
            initial: 'state11',
            on: [],
            promises: [],
            states: [
              {
                __id: 'state11',
                after: [],
                always: [],
                entry: [],
                exit: [],
                initial: 'state111',
                on: [],
                promises: [],
                states: [
                  {
                    __id: 'state111',
                    after: [],
                    always: [],
                    entry: [],
                    exit: [],
                    on: [],
                    promises: [],
                    states: [],
                    tags: [],
                    type: 'atomic',
                  },
                ],
                tags: [],
                type: 'compound',
              },
            ],
            tags: [],
            type: 'compound',
          },
        ],
        tags: [],
        type: 'compound',
      };

      test('#01 => initialNode', () => {
        expect(service.initialNode).toStrictEqual(node);
      });

      test('#02 => currentNode', () => {
        expect(service.node).toStrictEqual(node);
      });
    });

    describe('#05 => config', () => {
      const _config = {
        description: 'cdd',
        machines: {
          description: 'A beautiful machine',
          name: 'machine1',
        },
        initial: 'state1',
        states: {
          state1: {
            states: {
              state11: {
                states: {
                  state111: {},
                },
                initial: 'state111',
              },
            },
            initial: 'state11',
          },
        },
      };

      test('#01 => initial', () => {
        expect(service.initialConfig).toStrictEqual(_config);
      });

      test('#02 => current', () => {
        expect(service.config).toStrictEqual(_config);
      });
    });
  });

  describe('#03 => Exceed selfTransitionsCounter', () => {
    const fn = vi.spyOn(console, 'error');

    const machine = createMachine(
      {
        on: {
          ADD_CONDITION: { actions: 'addCondition' },
          REMOVE_CONDITION: { actions: 'removeCondition' },
        },
        states: {
          idle: {
            entry: 'inc',
            always: {
              target: '/working',
              guards: ['condition', 'limit'],
            },
            after: {
              DELAY: '/working',
            },
          },
          working: {
            entry: 'inc',
            always: {
              target: '/idle',
              guards: ['condition', 'limit'],
            },
            after: {
              DELAY: '/idle',
            },
          },
        },
      },
      {
        context: { condition: t.boolean, iterator: t.number },
        pContext: {},
        promiseesMap: {},
        eventsMap: {
          ADD_CONDITION: {},
          REMOVE_CONDITION: {},
        },
      },
      { '/': 'idle' },
    ).provideOptions(({ isValue }) => ({
      actions: {
        addCondition: (pContext, context) => ({
          pContext,
          context: { ...context, condition: true },
        }),
        removeCondition: (pContext, context) => ({
          pContext,
          context: { ...context, condition: false },
        }),
        inc: (pContext, context) => ({
          pContext,
          context: { ...context, iterator: context.iterator + 1 },
        }),
      },
      predicates: {
        condition: isValue('context.condition', false),
        limit: (_, { iterator }) => {
          return iterator < 99;
        },
      },
      delays: {
        DELAY: MIN_ACTIVITY_TIME,
      },
    }));

    const service = interpret(machine, {
      ...defaultC,
      context: { condition: false, iterator: 0 },
      mode: 'normal',
    });

    const error = `Too much self transitions, exceeded ${MAX_SELF_TRANSITIONS} transitions`;

    test('#01 => Start the service', async () => {
      vi.advanceTimersByTimeAsync(TIME_TO_RINIT_SELF_COUNTER);
      return await service.start();
    });

    describe('#02 => Error is throwing', () => {
      describe('#01 => console.error', () => {
        test('#01 => called one time', () => {
          expect(fn).toBeCalledTimes(1);
        });

        test('#02 => called with the error', () => {
          expect(fn).toHaveBeenNthCalledWith(1, error);
        });
      });

      describe('#02 => collector', () => {
        test('#01 => collector has one element', () => {
          expect(service._errorsCollector).toHaveLength(1);
        });

        test('#02 => collector has the error', () => {
          expect(service._errorsCollector).toContain(error);
        });
      });
    });
  });

  describe('#04 => Send without changed value', () => {
    const inc = vi.fn().mockReturnValue({ pContext: {}, context: {} });

    const machine = createMachine(
      {
        states: {
          idle: {
            on: {
              NEXT: { actions: 'inc' },
            },
          },
        },
      },
      { ...defaultT, eventsMap: { NEXT: {} } },
      { '/': 'idle' },
    ).provideOptions(() => ({
      actions: {
        inc,
      },
    }));

    const service = interpret(machine, defaultC);

    test('#00 => Start the service', service.start.bind(service));

    test('#01 => Check the snapshot', () => {
      const actaul = service.snapshot;
      const expected = {
        status: 'working',
        value: 'idle',
        context: {},
        mode: 'strict',
      };
      expect(actaul).toStrictEqual(expected);
    });

    test('#02 => Send NEXT', () => {
      service.send('NEXT');
    });

    test('#03 => inc is called', () => {
      expect(inc).toBeCalledTimes(1);
    });

    test('#04 => Send NEXT again', () => {
      service.send('NEXT');
    });

    test('#05 => inc is called again', () => {
      expect(inc).toBeCalledTimes(2);
    });
  });

  describe('#05 => After without changed value', () => {
    const inc = vi.fn().mockReturnValue({ pContext: {}, context: {} });

    const machine = createMachine(
      {
        states: {
          idle: {
            after: {
              NEXT: { actions: 'inc' },
            },
          },
        },
      },
      defaultT,
      { '/': 'idle' },
    ).provideOptions(() => ({
      actions: {
        inc,
      },
      delays: {
        NEXT: 1000,
      },
    }));

    const useWaiter = createFakeWaiter.withDefaultDelay(vi, 1000);

    const service = interpret(machine, defaultC);

    test('#01 => Start the service', () => {
      service.start();
    });

    test(...useWaiter(2));

    test('#03 => inc is called', () => {
      expect(inc).toBeCalledTimes(1);
    });

    test(...useWaiter(4));

    test('#05 => inc is not called again', () => {
      expect(inc).toBeCalledTimes(1);
    });
  });

  describe('#06 => Coverage getCollected0', () => {
    const inc = vi.fn().mockReturnValue({ pContext: {}, context: {} });
    const inc2 = vi.fn().mockReturnValue({ pContext: {}, context: {} });
    const src = vi.fn(() => Promise.resolve());

    const machine = createMachine(
      {
        states: {
          idle: {
            after: {
              DELAY: { actions: 'inc2' },
            },
            promises: {
              src: 'src',
              then: { actions: 'inc' /* , target: '/next' */ },
              catch: { actions: 'inc' },
            },
          },
          // next: {
          //   after: {
          //     DELAY: '/idle',
          //   },
          // },
        },
      },
      { ...defaultT, context: { iterator: t.number } },
      { '/': 'idle' },
    ).provideOptions(() => ({
      actions: {
        inc,
        inc2,
      },
      delays: {
        DELAY: 1000,
      },
      promises: {
        src,
      },
    }));

    const service = interpret(machine, {
      ...defaultC,
      context: { iterator: 0 },
    });

    test('#01 => Start the service', () => {
      service.start();
    });

    test('#02 => src is called', () => {
      expect(src).toBeCalledTimes(3);
    });

    test('#03 => inc2 is not called', () => {
      expect(inc2).toBeCalledTimes(0);
    });

    test('#04 => Wait 0', () => {
      return vi.advanceTimersByTimeAsync(1000);
    });

    test('#05 => inc is called', () => {
      expect(inc2).toBeCalledTimes(1);
    });

    describe('#06 => check collecteds0', () => {
      test('#01 => collecteds0 has one element', () => {
        expect(service._collecteds0).toHaveLength(1);
      });

      describe('#02 => promisee is defined', () => {
        const promisee = service._collecteds0?.get('/idle')?.promisee;

        test('#01 => promisee is defined', () => {
          expect(promisee).toBeDefined();
        });

        test('#02 => promisee is a function', () => {
          expect(promisee).toBeTypeOf('function');
        });

        test('#03 => promisee has id : "/idle"', () => {
          expect(promisee?.id).toBe('/idle');
        });
      });

      describe('#02 => after is defined', () => {
        const after = service._collecteds0?.get('/idle')?.after;

        test('#01 => after is defined', () => {
          expect(after).toBeDefined();
        });

        test('#02 => after is a function', () => {
          expect(after).toBeTypeOf('function');
        });

        test('#03 => after has id : "/idle"', () => {
          expect(after?.id).toBe('/idle');
        });
      });
    });
  });

  describe('#07 => sender', () => {
    describe('Activities Integration Test from perform', () => {
      const TEXT = 'Activities Integration Test from perform';
      // #region Config

      const service = interpret(machine21, {
        pContext: {
          iterator: 0,
        },
        context: { iterator: 0, input: '', data: [] },
        exact: true,
      });

      const subscriber = service.subscribeValue(
        {
          WRITE: (_, { value }) =>
            console.log('WRITE with', ':', `"${value}"`),
          NEXT: () => console.log('NEXT time, you will see!!'),
          else: nothing,
        },
        'idSub',
      );

      const dumbFn = vi.fn();
      service.___subscribeE(dumbFn, 'id');
      service.___subscribeE(dumbFn, 'id');
      const log = vi.spyOn(console, 'log').mockImplementation(() => {});

      beforeAll(() => {
        log.mockClear();
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
        describe(...useConsole(4, 'nothing call nothing'));
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

        describe(
          ...useConsole(
            4,
            'NEXT time, you will see!!',
            'NEXT time, you will see!!',
          ),
        );
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
        describe(
          ...useConsole(
            5,
            ['WRITE with', ':', '""'],
            ['WRITE with', ':', '""'],
          ),
        );
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
        describe(
          ...useConsole(5, 'nothing call nothing', 'nothing call nothing'),
        );
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
        describe(
          ...useConsole(6, ...Array(3).fill('nothing call nothing')),
        );
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

      test('#33 => machine1.value', () => {
        const child = service.at('machine1');
        expect(child?.value).toStrictEqual('idle');
      });

      test(...useSend('SEND', 34));
      test(...useWaiter(6, 35));
      describe(
        ...useConsole(
          36,
          'nothing call nothing',
          ...Array(6).fill('sendPanelToUser'),
        ),
      );

      test('#37 => machine1.value', () => {
        const child = service.at('machine1');
        expect(child?.value).toStrictEqual('final');
      });

      test('#38 => Resend idSub', () => {
        service.subscribeValue(nothing, 'idSub');
      });

      test('#39 => Resend machine1', () => {
        service.subscribeM('machine1', {
          machine: machine1,
          initials: toFunction({ context: { iterator: 0 }, pContext: {} }),
          subscribers: {
            events: EVENTS_FULL,
            contexts: {},
          },
        });
      });

      describe('#40 => Close the service', async () => {
        test('#01 => Pause the service', service.pause.bind(service));

        test('#02 => All intervals are paused', () => {
          expect(service.intervalsArePaused).toBe(true);
        });

        describe('#02 => Calls of log', () => {
          test('#01 => Length of calls of log is the same of length of strings', () => {
            expect(log).toBeCalledTimes(strings.length);
          });

          test('#02 => Log is called "85" times', () => {
            expect(log).toBeCalledTimes(85);
          });
        });

        test('#03', () => {
          expect(dumbFn).toBeCalledTimes(9);
        });

        test('#04 => Log the time of all tests', () => {
          console.timeEnd(TEXT);
        });

        test('#05 => dispose', service[Symbol.asyncDispose].bind(service));
      });
    });
  });
});
