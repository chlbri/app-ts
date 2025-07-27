import { castings } from '@bemedev/types';
import { interpret } from '~interpreter';
import { createMachine } from '~machine';
import type { StateValue } from '~states';
import { typings } from '~utils';

describe('Coverage of interpret #2', () => {
  describe('#01 => Cov select and pSelect for primitive units', () => {
    const machine = createMachine(
      {
        states: {
          idle: {
            entry: 'inc',
            on: {
              INC: { actions: 'inc' },
              'INC.PRIVATE': { actions: 'incPrivate' },
              NEXT: {
                target: '/final',
                description: 'Next',
                actions: ['inc', 'incPrivate'],
              },
            },
          },
          final: {},
        },
      },
      typings({
        eventsMap: {
          INC: 'primitive',
          'INC.PRIVATE': 'primitive',
          NEXT: 'primitive',
        },
        context: 'number',
        pContext: 'number',
      }),
      { '/': 'idle' },
    ).provideOptions(({ assign }) => ({
      actions: {
        inc: assign('context', ({ context }) => context + 1),
        incPrivate: assign('pContext', ({ pContext }) => pContext + 1),
      },
    }));

    const service = interpret(machine, {
      context: 0,
      pContext: 0,
      exact: true,
    });

    type SE = Parameters<typeof service.send>[0];

    const useSend = (event: SE, index: number) => {
      const invite = `#${index < 10 ? '0' + index : index} => Send a "${(event as any).type ?? event}" event`;

      return castings.arrays.tupleOf(invite, () => service.send(event));
    };

    const useIterator = (num: number, index: number) => {
      const invite = `#${index < 10 ? '0' + index : index} => iterator is "${num}"`;
      return castings.arrays.tupleOf(invite, async () => {
        expect(service.select).toBeUndefined();
        expect(service.state.context).toBe(num);
      });
    };

    const usePIterator = (num: number, index: number) => {
      const invite = `#${index < 10 ? '0' + index : index} => pIterator is "${num}"`;
      return castings.arrays.tupleOf(invite, async () => {
        expect(service._pSelect).toBeUndefined();
        expect(service._pContext).toBe(num);
      });
    };

    describe('TESTS', () => {
      it('#00 => Start the machine', () => {
        service.start();
      });

      it(...useIterator(1, 1));

      it(...usePIterator(0, 2));

      it(...useSend('INC', 3));

      it(...useIterator(2, 4));

      it(...usePIterator(0, 5));

      it(...useSend('INC.PRIVATE', 6));

      it(...useIterator(2, 7));

      it(...usePIterator(1, 8));

      it(...useSend('NEXT', 9));

      it(...useIterator(3, 10));

      it(...usePIterator(2, 11));

      it(...useSend('INC', 12));

      it(...useSend('INC.PRIVATE', 13));

      it(...useIterator(3, 14));

      it(...usePIterator(2, 15));

      it('#16 => Close the service', service[Symbol.asyncDispose]);
    });
  });

  describe('#02 => Cov loop on change state', () => {
    const machine = createMachine(
      {
        states: {
          idle: {
            on: {
              NEXT: {
                target: '/working',
                actions: 'inc',
              },
            },
          },
          working: {
            entry: 'inc',
            states: {
              idle: {
                entry: 'inc',
                on: {
                  NEXT: {
                    target: '/working/register',
                    actions: 'inc',
                  },
                },
              },
              register: {
                on: {
                  NEXT: { target: '/working/idle', actions: 'inc' },
                },
              },
            },
          },
        },
      },
      typings({
        eventsMap: {
          NEXT: 'primitive',
        },
        context: 'number',
        promiseesMap: 'primitive',
      }),
      { '/': 'idle', '/working': 'idle' },
    ).provideOptions(({ assign }) => ({
      actions: {
        inc: assign('context', ({ context }) => context + 1),
      },
    }));

    const service = interpret(machine, {
      context: 0,
      exact: true,
    });

    // #region Config
    type SE = Parameters<typeof service.send>[0];

    const useSend = (event: SE, index: number) => {
      const invite = `#${index < 10 ? '0' + index : index} => Send a "${(event as any).type ?? event}" event`;

      return castings.arrays.tupleOf(invite, () => service.send(event));
    };

    const useIterator = (num: number, index: number) => {
      const invite = `#${index < 10 ? '0' + index : index} => iterator is "${num}"`;
      return castings.arrays.tupleOf(invite, async () => {
        expect(service.select).toBeUndefined();
        expect(service.state.context).toBe(num);
      });
    };

    const useValue = (value: StateValue, index: number) => {
      const invite = `#${index < 10 ? '0' + index : index} => value is right`;
      return castings.arrays.tupleOf(invite, async () => {
        expect(service.state.value).toEqual(value);
      });
    };

    // #endregion

    describe('TESTS', () => {
      it('#00 => Start the machine', () => {
        service.start();
      });

      it(...useValue('idle', 0));

      it(...useIterator(0, 1));

      it(...useSend('NEXT', 2));

      it(...useValue({ working: 'idle' }, 3));

      it(...useIterator(3, 4));

      it(...useSend('NEXT', 5));

      it(...useValue({ working: 'register' }, 6));

      it(...useIterator(4, 7));

      it(...useSend('NEXT', 8));

      it(...useValue({ working: 'idle' }, 9));

      it(...useIterator(6, 10));

      it('#11 => Close the service', service[Symbol.asyncDispose]);
    });
  });
});
