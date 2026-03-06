import tupleOf from '#bemedev/features/arrays/castings/tuple';
import { interpret } from '#interpreter';
import { createMachine } from '#machine';
import { notU, typings } from '#utils';

describe('Coverage of interpretr #2', () => {
  describe('#01 => Cov select and pSelect for primitive units', () => {
    const machine = createMachine(
      {
        initial: 'initialize',
        states: {
          initialize: {
            always: {
              target: '/idle',
              actions: ['initialize'],
            },
          },
          idle: {
            entry: ['inc'],
            on: {
              INC: { actions: 'inc' },
              'INC.PRIVATE': { actions: 'incPrivate' },
              NEXT: {
                description: 'Next',
                actions: ['inc', 'incPrivate'],
                target: '/final',
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
    ).provideOptions(({ assign, batch }) => ({
      actions: {
        initialize: batch(
          assign('context', () => 0),
          assign('pContext', () => 0),
        ),
        inc: assign('context', ({ context }) => notU(context) + 1),
        incPrivate: assign(
          'pContext',
          ({ pContext }) => notU(pContext) + 1,
        ),
      },
    }));

    const service = interpret(machine, {
      exact: true,
    });

    type SE = Parameters<typeof service.send>[0];

    const useSend = (event: SE, index: number) => {
      const invite = `#${index < 10 ? '0' + index : index} => Send a "${(event as any).type ?? event}" event`;

      return tupleOf(invite, () => service.send(event));
    };

    const useIterator = (num: number, index: number) => {
      const invite = `#${index < 10 ? '0' + index : index} => iterator is "${num}"`;
      return tupleOf(invite, async () => {
        expect(service.select).toBeUndefined();
        expect(service.state.context).toBe(num);
      });
    };

    const usePIterator = (num: number, index: number) => {
      const invite = `#${index < 10 ? '0' + index : index} => pIterator is "${num}"`;
      return tupleOf(invite, async () => {
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
});
