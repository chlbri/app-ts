import { t } from '@bemedev/types';
import { createFakeWaiter } from '@bemedev/vitest-extended';
import { MAX_SELF_TRANSITIONS, MIN_ACTIVITY_TIME } from '~constants';
import { createMachine } from '~machine';
import { machine3 } from './__tests__/data/machine3';
import { defaultC, defaultT } from './__tests__/fixtures';
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
          console.log('iterator', '=>', iterator);
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
      const actaul = service.getSnapshot();
      const expected = {
        status: 'working',
        value: 'idle',
        context: {},
        scheduleds: 2,
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
});
