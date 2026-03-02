import tupleOf from '#bemedev/features/arrays/castings/tuple';
import { interpret } from '#interpreters';
import { constructTests } from '../fixtures';
import { DELAY } from './constants';
import { fakeDB } from './fakeDB';
import { machine23 } from './machine23';

describe('Machine 23 -> Tests for inner machines', () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  describe('#01 => Integration', () => {
    const TEXT = '#01 => Machine 23 inner machines integration test';

    describe(TEXT, () => {
      // #region Config

      const service = interpret(machine23);

      const INPUT = 'a';

      const FAKES = fakeDB
        .filter(({ name }) => name.includes(INPUT))
        .map(({ name }) => name);

      const {
        useIterator,
        useIteratorC,
        useInput,
        useWrite,
        useData,
        start,
        pause,
        resume,
        stop,
        send,
        useWaiter,
      } = constructTests(service, ({ contexts, waiter, sender }) => ({
        useWaiter: waiter(DELAY),
        useInput: contexts(({ context }) => context?.input, 'input'),
        useWrite: sender('WRITE'),

        useIterator: contexts(
          ({ context }) => context?.iterator,
          'iterator',
        ),

        useIteratorC: contexts(
          ({ pContext }) => (pContext as any)?.iterator,
          'pIterator',
        ),

        useData: (index: number, ...datas: any[]) => {
          const inviteStrict = `#02 => Check strict data`;

          const strict = () => {
            expect(service.context?.data).toStrictEqual(datas);
          };

          const inviteLength = `#01 => Length of data is ${datas.length}`;

          const length = () => {
            expect(service.context?.data?.length).toBe(datas.length);
          };

          const _index = index < 10 ? '0' + index : index;
          const invite = `#${_index} => Check data`;
          const func = () => {
            test(inviteLength, length);
            test(inviteStrict, strict);
          };

          return tupleOf(invite, func);
        },
      }));

      // #endregion

      beforeAll(() => {
        console.time(TEXT);
      });

      test(...start());

      test(...useWaiter(6));

      describe('#02 => Check the service', () => {
        test(...useIterator(6, 1));
        test(...useIteratorC(0, 2));
      });

      test(...send('NEXT'));

      describe('#04 => Check the service', () => {
        test(...useIterator(6, 1));
      });

      test(...useWaiter(6));

      describe('#06 => Check the service', () => {
        test(...useIteratorC(6, 1));
        test(...useIterator(18, 2));
      });

      test(...pause());

      describe('#08 => Check the service', () => {
        test(...useIterator(18, 1));
      });

      test(...useWaiter(6));

      describe('#10 => Check the service', () => {
        test(...useIterator(18, 1));
      });

      test(...resume());

      test(...useWaiter(12));

      describe('#13 => Check the service', () => {
        test(...useIterator(42, 1));
        test(...useIteratorC(18, 2));
      });

      test(...useWrite({ value: '' }));

      describe('#15 => Check the service', () => {
        test(...useIterator(42, 1));
        test(...useIteratorC(18, 2));
        test(...useInput('', 3));
      });

      test(...useWaiter(12));

      describe('#17 => Check the service', () => {
        test(...useIterator(66, 1));
        test(...useIteratorC(18, 2));
        test(...useInput('', 3));
      });

      test(...useWrite({ value: INPUT }));

      describe('#19 => Check the service', () => {
        test(...useIterator(66, 1));
        test(...useIteratorC(18, 2));
        test(...useInput('', 3));
      });

      test(...useWaiter(12));

      describe('#21 => Check the service', () => {
        test(...useIterator(90, 1));
        test(...useIteratorC(30, 2));
        test(...useInput('', 3));
      });

      test(...useWrite({ value: INPUT }));

      describe('#23 => Check the service', () => {
        test(...useIterator(90, 1));
        test(...useIteratorC(30, 2));
        test(...useInput(INPUT, 3));
      });

      test(...useWaiter(6));

      describe('#25 => Check the service', () => {
        test(...useIterator(102, 1));
        test(...useIteratorC(30, 2));
        test(...useInput(INPUT, 3));
        describe(...useData(4));
      });

      test(...send('FETCH'));

      describe('#27 => Check the service', () => {
        test(...useIterator(102, 1));
        test(...useIteratorC(30, 2));
        test(...useInput(INPUT, 3));
        describe(...useData(4, ...FAKES));
      });

      test(...useWaiter(6));

      describe('#29 => Check the service', () => {
        test(...useIterator(114, 1));
        test(...useIteratorC(30, 2));
        test(...useInput(INPUT, 3));
        describe(...useData(4, ...FAKES));
      });

      test(...send('FINISH'));

      test('#32 => Wait for debounce', () => {
        vi.advanceTimersByTime(10_000);
      });

      describe('#33 => Check the service', () => {
        test(...useIterator(1000, 1));
      });

      describe('#34 => Close the service', () => {
        test(...stop(1));

        test('#02 => Log the time of all tests', () => {
          console.timeEnd(TEXT);
        });

        test('#03 => dispose', service[Symbol.asyncDispose].bind(service));
      });
    });
  });
});
