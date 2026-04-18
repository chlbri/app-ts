import { constructTests } from '#fixtures';
import { interpret } from '#interpreter';
import _childMachine1 from './2ids.1.machine';
import _machine2 from './2ids.2.machine';

vi.useFakeTimers();

describe('Coverage actors', () => {
  describe('#03 => From describe 2 but, two different ids', () => {
    const DELAY = 350;
    const childMachine = _childMachine1.provideOptions(({ assign }) => ({
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
          child1: () =>
            interpret(childMachine, { context: { iter1: 0, iter2: 0 } }),
          child2: () =>
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
    test(...useIter1(2));
    test(...useIter2(0));
    test(...useAll({ iter1: 2, iter2: 1 }));
    test(...useStateValue('working'));
    test(...waiter());
    test(...useStateValue('working'));
    test(...useIter1(2));
    test(...useIter2(1));
    test(...useAll({ iter1: 2, iter2: 1 }));
    test(...useStateValue('working'));
    test(...waiter());
    test(...useStateValue('working'));
    test(...useIter1(2));
    test(...useIter2(1));
    test(...useAll({ iter1: 2, iter2: 1 }));
    test(...useStateValue('working'));
    test(...send('NEXT'));
    test(...useStateValue('idle'));
    test(...useIter1(2));
    test(...useIter2(1));
    test(...useAll({ iter1: 2, iter2: 1 }));
    test(...useStateValue('idle'));
    test(...waiter());
    test(...useStateValue('idle'));
    test(...useIter1(1));
    test(...useIter2(1));
    test(...useAll({ iter1: 1, iter2: 0 }));
    test(...useStateValue('idle'));
    test(...waiter());
    test(...useStateValue('idle'));
    test(...useIter1(2));
    test(...useIter2(1));
    test(...useAll({ iter1: 2, iter2: 1 }));
    test(...useStateValue('idle'));
    test(...send('NEXT'));
    test(...useStateValue('working'));
    test(...useIter1(2));
    test(...useIter2(1));
    test(...useAll({ iter1: 2, iter2: 1 }));
    test(...useStateValue('working'));
    test(...waiter());
    test(...useStateValue('working'));
    test(...useIter1(2));
    test(...useIter2(1));
    test(...useAll({ iter1: 2, iter2: 1 }));
    test(...useStateValue('working'));
    test(...waiter());
    test(...useStateValue('working'));
    test(...useIter1(2));
    test(...useIter2(1));
    test(...useAll({ iter1: 2, iter2: 1 }));
    test(...useStateValue('working'));
    test(...waiter());
    test(...useStateValue('working'));
    test(...useIter1(2));
    test(...useIter2(1));
    test(...useAll({ iter1: 2, iter2: 1 }));
    test(...useStateValue('working'));
    test(...waiter());
    test(...useStateValue('working'));
    test(...useIter1(2));
    test(...useIter2(2));
    test(...useAll({ iter1: 2, iter2: 1 }));
    test(...useStateValue('working'));
    test(...send('NEXT'));
    test(...useStateValue('idle'));
    test(...useIter1(2));
    test(...useIter2(2));
    test(...useAll({ iter1: 2, iter2: 1 }));
    test(...useStateValue('idle'));
    test(...waiter());
    test(...useStateValue('idle'));
    test(...useIter1(1));
    test(...useIter2(2));
    test(...useAll({ iter1: 1, iter2: 0 }));
    test(...useStateValue('idle'));
    test(...waiter());
    test(...useStateValue('idle'));
    test(...useIter1(2));
    test(...useIter2(2));
    test(...useAll({ iter1: 2, iter2: 1 }));
    test(...useStateValue('idle'));
    test(...waiter());
    test(...useStateValue('idle'));
    test(...useIter1(3));
    test(...useIter2(2));
    test(...useAll({ iter1: 3, iter2: 1 }));
    test(...useStateValue('idle'));
    test(...waiter());
    test(...useStateValue('idle'));
    test(...useIter1(4));
    test(...useIter2(2));
    test(...useAll({ iter1: 4, iter2: 2 }));
    test(...useStateValue('idle'));
    test(...send('NEXT'));
    test(...useStateValue('working'));
    test(...useIter1(4));
    test(...useIter2(2));
    test(...useAll({ iter1: 4, iter2: 2 }));
    test(...useStateValue('working'));
    test(...waiter());
    test(...useStateValue('working'));
    test(...useIter1(4));
    test(...useIter2(2));
    test(...useAll({ iter1: 4, iter2: 2 }));
    test(...useStateValue('working'));
    test(...waiter());
    test(...useStateValue('working'));
    test(...useIter1(4));
    test(...useIter2(1));
    test(...useAll({ iter1: 4, iter2: 2 }));
    test(...useStateValue('working'));
    test(...waiter());
    test(...useStateValue('working'));
    test(...useIter1(4));
    test(...useIter2(1));
    test(...useAll({ iter1: 4, iter2: 2 }));
    test(...useStateValue('working'));
    test(...waiter());
    test(...useStateValue('working'));
    test(...useIter1(4));
    test(...useIter2(2));
    test(...useAll({ iter1: 4, iter2: 2 }));
    test(...useStateValue('working'));
    test(...stop());
  });
});
