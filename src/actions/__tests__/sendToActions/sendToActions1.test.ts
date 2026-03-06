import { interpret } from '#interpreter';
import { createMachine } from '#machine';
import { notU, typings } from '#utils';
import { constructTests } from '#fixtures';

vi.useFakeTimers();

describe('Performs send to itself actions', () => {
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
            DECREMENT: { actions: 'sendDec' },
            INCREMENT: { actions: ['inc', 'inc'] },
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
      inc: assign(
        'context.iterator',
        ({ context }) => notU(context?.iterator) + 1,
      ),

      init: assign('context', () => ({
        iterator: 0,
      })),

      dec: assign(
        'context.iterator',
        ({ context }) => notU(context?.iterator) - 1,
      ),

      forceSendInc: forceSend('INCREMENT'),
      sendDec: resend('DECREMENT'),
    },
  }));

  const service = interpret(machine101);
  const { useIterator, start, dispose, useStateValue, send } =
    constructTests(
      service,
      ({ contexts: constructContexts }) => ({
        useIterator: constructContexts(
          ({ context }) => context?.iterator,
          'iterator',
        ),
      }),
      1,
    );
  // #endregion

  test(...start());
  test(...useStateValue('idle'));
  test(...send('NEXT'));
  test(...useStateValue('next'));
  test(...useIterator(0));
  test(...send('INCREMENT'));
  test(...useIterator(2));
  test(...send('INCREMENT.FORCE'));
  test(...useIterator(5));
  test(...send('INCREMENT'));
  test(...useIterator(7));
  test(...send('REDECREMENT'));
  test(...useIterator(7));
  test(...dispose());
});
