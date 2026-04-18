import tupleOf from '#bemedev/features/arrays/castings/tuple';
import { _machine2, DELAY, fakeDB } from '#fixturesData';
import { constructTests } from '#fixtures';
import { interpret } from '#interpreters';
import { nothing } from '#utils';
import equal from 'fast-deep-equal';

describe('machine coverage', () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  describe('#01 => Integration', () => {
    const TEXT =
      '#02 => Activities Integration Test from perform -> stop before set to 1000';

    describe(TEXT, () => {
      const service = interpret(_machine2, {
        pContext: {
          iterator: 0,
        },
        context: { iterator: 0, input: '', data: [] },
        exact: true,
      });

      const subscriber = service.subscribe(
        {
          WRITE: ({ payload: { value } }) =>
            console.log('WRITE with', ':', `"${value}"`),
          NEXT: () => console.log('NEXT time, you will see!!'),
          else: nothing,
        },
        {
          equals: (s1, s2) => {
            return equal(s1.event, s2.event);
          },
        },
      );

      beforeAll(() => {
        console.time(TEXT);
      });

      const INPUT = 'a';

      const FAKES = fakeDB
        .filter(({ name }) => name.includes(INPUT))
        .map(({ name }) => name);

      const {
        start,
        pause,
        resume,
        dispose,
        send,
        waiter,
        useWrite,
        useIterator,
        useInput,
        useData,
      } = constructTests(service, ({ waiter: w, sender, contexts }) => {
        const useData = (index: number, ...datas: any[]) => {
          const inviteStrict = `#02 => Check strict data`;

          const strict = () => {
            expect(service.context.data).toStrictEqual(datas);
          };

          const inviteLength = `#01 => Length of data is ${datas.length}`;

          const length = () => {
            expect(service.context.data.length).toBe(datas.length);
          };

          const invite = `#${index < 10 ? '0' + index : index} => Check data`;
          const func = () => {
            test(inviteLength, length);
            test(inviteStrict, strict);
          };

          return tupleOf(invite, func);
        };

        return {
          waiter: w(DELAY),
          useWrite: sender('WRITE'),
          useIterator: contexts(
            ({ context }) => context?.iterator,
            'iterator',
          ),
          useInput: contexts(({ context }) => context?.input, 'input'),
          useData,
        };
      });

      test(...start(0));

      test(...waiter(6, 1));

      describe('#02 => Check the service', () => {
        test(...useIterator(6, 2));
      });

      test(...send('NEXT', 3));

      describe('#05 => Check the service', () => {
        test(...useIterator(6, 2));
      });

      test(...waiter(6, 5));

      describe('#06 => Check the service', () => {
        test(...useIterator(18, 1));
      });

      test(...pause(7));

      describe('#08 => Check the service', () => {
        test(...useIterator(18, 2));
      });

      test(...waiter(6, 9));

      describe('#10 => Check the service', () => {
        test(...useIterator(18, 2));
      });

      test(...resume(11));

      test(...waiter(12, 12));

      describe('#13 => Check the service', () => {
        test(...useIterator(42, 2));
      });

      test(...useWrite({ value: '' }));

      describe('#15 => Check the service', () => {
        test(...useIterator(42, 2));
        test(...useInput('', 4));
      });

      test(...waiter(12, 16));

      describe('#17 => Check the service', () => {
        test(...useIterator(66, 2));
        test(...useInput('', 4));
      });

      test(...useWrite({ value: INPUT }));

      describe('#19 => Check the service', () => {
        test(...useIterator(66, 2));
        test(...useInput('', 4));
      });

      test(...waiter(12, 20));

      describe('#21 => Check the service', () => {
        test(...useIterator(90, 2));
        test(...useInput('', 4));
      });

      test(
        '#22 => Close the subscriber',
        subscriber.close.bind(subscriber),
      );

      test(...useWrite({ value: INPUT }));

      describe('#24 => Check the service', () => {
        test(...useIterator(90, 2));
        test(...useInput(INPUT, 4));
      });

      test(...waiter(6, 25));

      describe('#26 => Check the service', () => {
        test(...useIterator(102, 2));
        test(...useInput(INPUT, 4));
        describe(...useData(5));
      });

      test(...send('FETCH', 27));

      describe('#28 => Check the service', () => {
        test(...useIterator(102, 2));
        test(...useInput(INPUT, 4));
        describe(...useData(5, ...FAKES));
      });

      test(...waiter(0, 29));

      describe('#30 => Check the service', () => {
        test(...useIterator(102, 2));
        test(...useInput(INPUT, 4));
        describe(...useData(5, ...FAKES));
      });

      test(...waiter(6, 31));

      describe('#32 => Check the service', () => {
        test(...useIterator(114, 2));
        test(...useInput(INPUT, 4));
        describe(...useData(5, ...FAKES));
      });

      test('#33 => Send Finish', () => {
        service.send('FINISH');
        vi.advanceTimersByTime(1_000);
      });

      describe('#34 => Check the service', () => {
        test(...useIterator(118, 2));
      });

      describe('#35 => Close the service', async () => {
        test(...pause(1));

        test('#02 => Log the time of all tests', () => {
          console.timeEnd(TEXT);
        });

        test(...dispose(3));
      });

      test('#36 => Wait for debounce', () => {
        vi.advanceTimersByTime(10_000);
      });

      test(...useIterator(118, 37));
    });
  });
});
