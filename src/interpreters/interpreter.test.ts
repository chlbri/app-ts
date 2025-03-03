import { t } from '@bemedev/types';
import { MAX_SELF_TRANSITIONS } from '~constants';
import { createMachine } from '~machine';
import { machine3 } from './__tests__/data/machine3';
import { defaultC, defaultT } from './__tests__/fixtures';
import { interpret } from './interpreter';
import type { AnyInterpreter } from './interpreter.types';

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

    beforeAll(() => {
      fn.mockClear();
    });

    const machine = createMachine(
      {
        states: {
          idle: {
            always: '/working',
          },
          working: {
            always: '/idle',
          },
        },
      },
      defaultT,
      { '/': 'idle' },
    );
    const service = interpret(machine, { ...defaultC, mode: 'normal' });

    const error = `Too much self transitions, exceeded ${MAX_SELF_TRANSITIONS} transitions`;

    test('#01 => Start the service', service.start.bind(service));

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
          expect(service.errorsCollector).toHaveLength(1);
        });

        test('#02 => collector has the error', () => {
          expect(service.errorsCollector).toContain(error);
        });
      });
    });
  });
});
