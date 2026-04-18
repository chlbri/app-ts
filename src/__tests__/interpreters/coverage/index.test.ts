import tupleOf from '#bemedev/features/arrays/castings/tuple';
import { interpret } from '#interpreter';
import _raw_machine from './index.machine';

describe('Coverage of interpretr #2', () => {
  describe('#01 => Cov select and pSelect for primitive units', () => {
    const machine = _raw_machine.provideOptions(
      ({ assign, voidAction }) => ({
        actions: {
          inc: assign('context', ({ context }) => context + 1),
          incPrivate: assign('pContext', ({ pContext }) => pContext + 1),
          neverRun: voidAction({}),
        },
      }),
    );

    const service = interpret(machine, {
      exact: true,
      context: 0,
      pContext: 0,
    });

    service.subscribe({});

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
