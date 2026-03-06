import { interpret } from '#interpreter';
import { createMachine } from '#machine';
import { notU, typings } from '#utils';
import { constructTests } from '#fixtures';

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

      promiseesMap: 'primitive',
      pContext: 'primitive',

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
  });

  const { useIterator, start, dispose, useStateValue, send } =
    constructTests(service, ({ contexts: constructContexts }) => ({
      useIterator: constructContexts(
        ({ context }) => context?.iterator,
        'iterator',
      ),
    }));

  test(...start());
  test(...useIterator(0));
  test(...send('INCREMENT'));
  test(...useIterator(1));
  test(...send('INCREMENT'));
  test(...useIterator(2));
  test(...send('DECREMENT'));
  test(...useIterator(1));
  test(...useStateValue('idle'));
  test(...send('NEXT'));
  test(...useStateValue('next'));
  test(...useIterator(1));
  test(...send('INCREMENT'));
  test(...useIterator(1));
  test(...send('INCREMENT.FORCE'));
  test(...useIterator(2));
  test(...send('INCREMENT'));
  test(...useIterator(2));
  test(...send('REDECREMENT'));
  test(...useIterator(2));
  test(...useStateValue('next'));
  test(...send('NEXT'));
  test(...useStateValue('idle'));
  test(...useIterator(2));
  test(...send('REDECREMENT'));
  test(...useIterator(1));
  test(...send('DECREMENT'));
  test(...useIterator(0));
  test(...send('INCREMENT'));
  test(...useIterator(1));
  test(...send('INCREMENT.FORCE'));
  test(...useIterator(1));
  test(...send('INCREMENT'));
  test(...useIterator(2));
  test(...send('REDECREMENT'));
  test(...useIterator(1));
  test(...dispose());
});
