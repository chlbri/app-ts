import { constructTests } from '#fixtures';
import { interpret } from '#interpreter';
import _childMachine1 from './child.1.machine';
import _machine2 from './child.2.machine';

vi.useFakeTimers();

describe('Coverage actors', () => {
  describe('#02 => same child actor id in two states', () => {
    const DELAY = 350;
        const childMachine = _childMachine1
    .provideOptions(({ assign }) => ({
      actions: {
        inc: assign('context.iter1', ({ context }) => context.iter1 + 1),
        inc2: assign('context.iter2', ({ context }) => context.iter2 + 1),
      },
      delays: { DELAY, DELAY2: DELAY * 2 },
    }));

        const machine = _machine2;

    machine.addOptions(() => ({
      actors: {
        children: {
          child: () =>
            interpret(childMachine, { context: { iter1: 0, iter2: 0 } }),
        },
      },
    }));

    const service = interpret(machine, {
      pContext: {
        iter1: 0,
        iter2: 0,
        all: {
          iter1: 0,
          iter2: 0,
        },
      },
    });

    const {
      start,
      stop,
      send,
      useStateValue,
      waiter,
      useIter1,
      useIter2,
      useAll,
    } = constructTests(service, ({ waiter, contexts }) => ({
      waiter: waiter(DELAY),
      useIter1: contexts(({ pContext }) => pContext.iter1, 'iter1'),
      useIter2: contexts(({ pContext }) => pContext.iter2, 'iter2'),
      useAll: contexts(({ pContext }) => pContext.all, 'all'),
    }));

    test(...start());
    test(...useStateValue('idle'));
    test(...useIter1(0));
    test(...useIter2(0));
    test(...useAll({ iter1: 0, iter2: 0 }));
    test(...useStateValue('idle'));
    test(...waiter());
    test(...useStateValue('idle'));
    test(...useIter1(1));
    test(...useIter2(0));
    test(...useAll({ iter1: 1, iter2: 0 }));
    test(...useStateValue('idle'));
    test(...useIter1(1));
    test(...useIter2(0));
    test(...useAll({ iter1: 1, iter2: 0 }));
    test(...useStateValue('idle'));
    test(...waiter());
    test(...useStateValue('idle'));
    test(...useIter1(2));
    test(...useIter2(0));
    test(...useAll({ iter1: 2, iter2: 1 }));
    test(...useStateValue('idle'));
    test(...send('NEXT'));
    test(...useStateValue('working'));
    test(...useIter1(2));
    test(...useIter2(0));
    test(...useAll({ iter1: 2, iter2: 1 }));
    test(...useStateValue('working'));
    test(...waiter());
    test(...useStateValue('working'));
    test(...useIter1(3));
    test(...useIter2(0));
    test(...useAll({ iter1: 3, iter2: 1 }));
    test(...useStateValue('working'));
    test(...waiter());
    test(...useStateValue('working'));
    test(...useIter1(4));
    test(...useIter2(1));
    test(...useAll({ iter1: 4, iter2: 2 }));
    test(...useStateValue('working'));
    test(...waiter());
    test(...useStateValue('working'));
    test(...useIter1(5));
    test(...useIter2(1));
    test(...useAll({ iter1: 5, iter2: 2 }));
    test(...useStateValue('working'));
    test(...send('NEXT'));
    test(...useStateValue('idle'));
    test(...useIter1(5));
    test(...useIter2(1));
    test(...useAll({ iter1: 5, iter2: 2 }));
    test(...useStateValue('idle'));
    test(...waiter());
    test(...useStateValue('idle'));
    test(...useIter1(6));
    test(...useIter2(1));
    test(...useAll({ iter1: 6, iter2: 2 }));
    test(...useStateValue('idle'));
    test(...waiter());
    test(...useStateValue('idle'));
    test(...useIter1(7));
    test(...useIter2(2));
    test(...useAll({ iter1: 7, iter2: 3 }));
    test(...useStateValue('idle'));
    test(...send('NEXT'));
    test(...useStateValue('working'));
    test(...useIter1(7));
    test(...useIter2(2));
    test(...useAll({ iter1: 7, iter2: 3 }));
    test(...useStateValue('working'));
    test(...waiter());
    test(...useStateValue('working'));
    test(...useIter1(8));
    test(...useIter2(2));
    test(...useAll({ iter1: 8, iter2: 3 }));
    test(...useStateValue('working'));
    test(...waiter());
    test(...useStateValue('working'));
    test(...useIter1(9));
    test(...useIter2(3));
    test(...useAll({ iter1: 9, iter2: 4 }));
    test(...useStateValue('working'));
    test(...waiter());
    test(...useStateValue('working'));
    test(...useIter1(10));
    test(...useIter2(3));
    test(...useAll({ iter1: 10, iter2: 4 }));
    test(...useStateValue('working'));
    test(...waiter());
    test(...useStateValue('working'));
    test(...useIter1(11));
    test(...useIter2(4));
    test(...useAll({ iter1: 11, iter2: 5 }));
    test(...useStateValue('working'));
    test(...send('NEXT'));
    test(...useStateValue('idle'));
    test(...useIter1(11));
    test(...useIter2(4));
    test(...useAll({ iter1: 11, iter2: 5 }));
    test(...useStateValue('idle'));
    test(...waiter());
    test(...useStateValue('idle'));
    test(...useIter1(12));
    test(...useIter2(4));
    test(...useAll({ iter1: 12, iter2: 5 }));
    test(...useStateValue('idle'));
    test(...waiter());
    test(...useStateValue('idle'));
    test(...useIter1(13));
    test(...useIter2(5));
    test(...useAll({ iter1: 13, iter2: 6 }));
    test(...useStateValue('idle'));
    test(...waiter());
    test(...useStateValue('idle'));
    test(...useIter1(14));
    test(...useIter2(5));
    test(...useAll({ iter1: 14, iter2: 6 }));
    test(...useStateValue('idle'));
    test(...waiter());
    test(...useStateValue('idle'));
    test(...useIter1(15));
    test(...useIter2(6));
    test(...useAll({ iter1: 15, iter2: 7 }));
    test(...useStateValue('idle'));
    test(...send('NEXT'));
    test(...useStateValue('working'));
    test(...useIter1(15));
    test(...useIter2(6));
    test(...useAll({ iter1: 15, iter2: 7 }));
    test(...useStateValue('working'));
    test(...waiter());
    test(...useStateValue('working'));
    test(...useIter1(16));
    test(...useIter2(6));
    test(...useAll({ iter1: 16, iter2: 7 }));
    test(...useStateValue('working'));
    test(...waiter());
    test(...useStateValue('working'));
    test(...useIter1(17));
    test(...useIter2(7));
    test(...useAll({ iter1: 17, iter2: 8 }));
    test(...useStateValue('working'));
    test(...waiter());
    test(...useStateValue('working'));
    test(...useIter1(18));
    test(...useIter2(7));
    test(...useAll({ iter1: 18, iter2: 8 }));
    test(...useStateValue('working'));
    test(...waiter());
    test(...useStateValue('working'));
    test(...useIter1(19));
    test(...useIter2(8));
    test(...useAll({ iter1: 19, iter2: 9 }));
    test(...useStateValue('working'));
    test(...stop());
  });
});
