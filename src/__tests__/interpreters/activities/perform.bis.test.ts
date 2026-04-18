import tupleOf from '#bemedev/features/arrays/castings/tuple';
import { interpret } from '#interpreter';
import { createMachine } from '#machine';
import { notU, typings } from '#utils';

vi.useFakeTimers();
describe('cov => Performs send to itself actions', () => {
  const machine101 = createMachine(
    {
      entry: 'init',
      initial: 'idle',
      states: {
        idle: {
          on: {
            DECREMENT: { actions: 'dec' },
            INCREMENT: { actions: 'inc' },
            REDECREMENT: { actions: 'sendDec' },
            NEXT: '/next',
          },
        },
        next: {
          on: {
            NEXT: '/idle',
            'INCREMENT.FORCE': { actions: 'forceSendInc' },
            REDECREMENT: { actions: 'sendDec' },
          },
        },
      },
    },
    typings({
      eventsMap: {
        DECREMENT: 'primitive',
        REDECREMENT: 'primitive',
        INCREMENT: 'primitive',
        'INCREMENT.FORCE': 'primitive',
        NEXT: 'primitive',
      },

      context: typings.partial({
        iterator: 'number',
      }),
    }),
  ).provideOptions(({ assign, forceSend, resend }) => ({
    actions: {
      inc: assign('context.iterator', ({ context }) => {
        const iterator = notU(context?.iterator);
        if (iterator === undefined) return;

        return iterator + 1;
      }),

      dec: assign('context.iterator', ({ context }) => {
        const iterator = notU(context?.iterator);
        if (iterator === undefined) return;
        return iterator - 1;
      }),

      init: assign('context', () => ({
        iterator: 0,
      })),

      forceSendInc: forceSend('INCREMENT'),
      sendDec: resend('DECREMENT'),
    },
  }));

  const service = interpret(machine101, {
    exact: true,
    context: {},
  });

  type SE = Parameters<typeof service.send>[0];

  // #region Hooks
  const useSend = (event: SE, index: number) => {
    const invite = `#${index < 10 ? '0' + index : index} => Send a "${(event as any).type ?? event}" event`;

    return tupleOf(invite, () => service.send(event));
  };

  const useIterator = (iterator: number, index: number) => {
    const invite = `#${index < 10 ? '0' + index : index} => iterator is "${iterator}"`;
    return tupleOf(invite, async () => {
      expect(service.select('iterator')).toBe(iterator);
    });
  };

  const useValue = (value: string, index: number) => {
    const invite = `#${index < 10 ? '0' + index : index} => value is "${value}"`;
    return tupleOf(invite, async () => {
      expect(service.value).toBe(value);
    });
  };
  // #endregion

  test('#00 => Start the machine', () => {
    service.start();
  });

  // #region "idle" state
  test(...useIterator(0, 1));

  test(...useSend('INCREMENT', 2));

  test(...useIterator(1, 3));

  test(...useSend('INCREMENT', 4));

  test(...useIterator(2, 5));

  test(...useSend('DECREMENT', 6));

  test(...useIterator(1, 7));
  // #endregion

  test(...useValue('idle', 8));

  test(...useSend('NEXT', 9));

  test(...useValue('next', 10));

  // #region "next" state
  test(...useIterator(1, 11));

  test(...useSend('INCREMENT', 12));

  test(...useIterator(1, 13));

  test(...useSend('INCREMENT.FORCE', 14));

  test(...useIterator(2, 15));

  test(...useSend('INCREMENT', 16));

  test(...useIterator(2, 17));

  test(...useSend('REDECREMENT', 18));

  test(...useIterator(2, 19));
  // #endregion

  test(...useValue('next', 20));

  test(...useSend('NEXT', 21));

  test(...useValue('idle', 22));

  // #region "idle" state again

  test(...useIterator(2, 23));

  test(...useSend('REDECREMENT', 24));

  test(...useIterator(1, 25));

  test(...useSend('DECREMENT', 26));

  test(...useIterator(0, 27));

  test(...useSend('INCREMENT', 28));

  test(...useIterator(1, 29));

  test(...useSend('INCREMENT.FORCE', 30));

  test(...useIterator(1, 31));

  test(...useSend('INCREMENT', 32));

  test(...useIterator(2, 33));

  test(...useSend('REDECREMENT', 34));

  test(...useIterator(1, 35));

  // #endregion

  test('#36 => Dispose', service.dispose);
});
