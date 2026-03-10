import tupleOf from '#bemedev/features/arrays/castings/tuple';
import { _machine2, DELAY, fakeDB } from '#fixturesData';
import { interpret } from '#interpreters';
import { nothing } from '#utils';
import equal from 'fast-deep-equal';
import { constructTests, fakeWaiter } from '../../../fixtures';

describe('machine coverage', () => {
  beforeAll(() => vi.useFakeTimers());

  describe('#01 => Integration', () => {
    const TEXT = '#01 => Activities Integration Test from perform';

    describe(TEXT, () => {
      // #region Config

      const service = interpret(_machine2, {
        exact: true,
        context: { iterator: 0, input: '', data: [] },
        pContext: { iterator: 0 },
      });

      const {
        useIterator,
        useWaiter,
        useData,
        useInput,
        useWrite,
        // useConsole,
        start,
        pause,
        resume,
        stop,
        send,
      } = constructTests(service, ({ contexts, waiter, sender }) => ({
        useWaiter: waiter(DELAY),
        useContext: contexts(({ context }) => context),
        useInput: contexts(({ context }) => context?.input, 'input'),
        useWrite: sender('WRITE'),

        useData: (index: number, ...data: any[]) => {
          const inviteStrict = `#02 => Check strict data`;

          const strict = () => {
            expect(service.context?.data).toStrictEqual(data);
          };

          const inviteLength = `#01 => Length of data is ${data.length}`;

          const length = () => {
            expect(service.context?.data?.length).toBe(data.length);
          };

          const _index = index < 10 ? '0' + index : index;
          const invite = `#${_index} => Check data`;
          const func = () => {
            test(inviteLength, length);
            test(inviteStrict, strict);
          };

          return tupleOf(invite, func);
        },

        // useConsole: (
        //   index: number,
        //   ..._strings: (string | string[])[]
        // ) => {
        //   const inviteStrict = `#02 => Check strict string`;

        //   const strict = () => {
        //     const calls = strings.map(data => [data].flat());
        //     expect(log.mock.calls).toStrictEqual(calls);
        //   };

        //   const inviteLength = `#01 => Length of calls is : ${_strings.length}`;

        //   const length = () => {
        //     strings.push(..._strings);
        //     expect(log.mock.calls.length).toBe(strings.length);
        //   };

        //   const _index = index < 10 ? '0' + index : index;
        //   const invite = `#${_index} => Check the console`;
        //   const func = () => {
        //     test(inviteLength, length);
        //     test(inviteStrict, strict);
        //   };

        //   return tupleOf(invite, func);
        // },

        useIterator: contexts(
          ({ context }) => context?.iterator,
          'iterator',
        ),
      }));

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

      // const log = vi.spyOn(console, 'log').mockImplementation(() => {});

      beforeAll(() => {
        console.time(TEXT);
      });

      const INPUT = 'a';

      const FAKES = fakeDB
        .filter(({ name }) => name.includes(INPUT))
        .map(({ name }) => name);

      // const strings: (string | string[])[] = [];

      // #endregion

      test(...start());

      test(...useWaiter(6));

      describe('#02 => Check the service', () => {
        test(...useIterator(6, 1));
        // describe(...useConsole(2, 'Debounced action executed'));
      });

      test(...send('NEXT'));

      describe('#05 => Check the service', () => {
        test(...useIterator(6, 1));
        // describe(...useConsole(2, 'NEXT time, you will see!!'));
      });

      test(...useWaiter(6));

      describe('#06 => Check the service', () => {
        test(...useIterator(18, 1));
        // describe(...useConsole(2, ...Array(6).fill('sendPanelToUser')));
      });

      test(...pause());

      describe('#08 => Check the service', () => {
        test(...useIterator(18, 1));
        // describe(...useConsole(2));
      });

      test(...useWaiter(6));

      describe('#10 => Check the service', () => {
        test(...useIterator(18, 1));
        // describe(...useConsole(2));
      });

      test(...resume());
      test(...useWaiter(12));

      describe('#13 => Check the service', () => {
        test(...useIterator(42, 1));
        // describe(...useConsole(2, ...Array(12).fill('sendPanelToUser')));
      });

      test(...useWrite({ value: '' }));

      describe('#15 => Check the service', () => {
        test(...useIterator(42, 1));
        test(...useInput('', 2));
        // describe(...useConsole(3, ['WRITE with', ':', '""']));
      });

      test(...useWaiter(12, 16));

      describe('#17 => Check the service', () => {
        test(...useIterator(66, 1));
        test(...useInput('', 2));

        // describe(
        //   ...useConsole(
        //     3,
        //     ...Array(24)
        //       .fill(0)
        //       .map((_, index) => {
        //         const isEven = index % 2 === 0;
        //         return isEven ? 'sendPanelToUser' : 'Input, please !!';
        //       }),
        //   ),
        // );
      });

      test(...useWrite({ value: INPUT }));

      describe('#19 => Check the service', () => {
        test(...useIterator(66, 1));
        test(...useInput('', 2));
        // describe(...useConsole(3, ['WRITE with', ':', `"${INPUT}"`]));
      });

      test(...useWaiter(12, 20));

      describe('#21 => Check the service', () => {
        test(...useIterator(90, 1));
        test(...useInput('', 2));
        // describe(...useConsole(3, ...Array(12).fill('sendPanelToUser')));
      });

      test(
        '#22 => Close the subscriber',
        subscriber.close.bind(subscriber),
      );

      test(...useWrite({ value: INPUT }));

      describe('#24 => Check the service', () => {
        test(...useIterator(90, 1));
        test(...useInput(INPUT, 2));
        // describe(...useConsole(3));
      });

      test(...useWaiter(6, 25));

      describe('#26 => Check the service', () => {
        test(...useIterator(102, 1));
        test(...useInput(INPUT, 2));
        describe(...useData(3));
        // describe(...useConsole(4, ...Array(6).fill('sendPanelToUser')));
      });

      test(...send('FETCH', 27));

      describe('#28 => Check the service', () => {
        test(...useIterator(102, 1));
        test(...useInput(INPUT, 2));
        describe(...useData(3, ...FAKES));
        // describe(...useConsole(4));
      });

      test('#29 => Await the fetch', () => fakeWaiter());

      describe('#30 => Check the service', () => {
        test(...useIterator(102, 1));
        test(...useInput(INPUT, 2));
        describe(...useData(3, ...FAKES));
        // describe(...useConsole(4));
      });

      test(...useWaiter(6, 31));

      describe('#32 => Check the service', () => {
        test(...useIterator(114, 2));
        test(...useInput(INPUT, 2));
        describe(...useData(3, ...FAKES));
        // describe(...useConsole(4, ...Array(6).fill('sendPanelToUser')));
      });

      test('#33 => Wait for debounce', () => {
        service.send('FINISH');
        vi.advanceTimersByTime(10_000);
      });

      describe('#34 => Check the service', () => {
        test(...useIterator(1000, 1));
        // describe(...useConsole(2));
      });

      describe('#35 => Close the service', async () => {
        test(...stop(1));

        describe('#02 => Calls of log', () => {
          // test('#01 => Length of calls of log is the same of length of strings', () => {
          //   expect(log).toBeCalledTimes(strings.length);
          // });
          // test('#02 => Log is called "70" times', () => {
          //   expect(log).toBeCalledTimes(70);
          // });
        });

        test('#03 => Log the time of all tests', () => {
          console.timeEnd(TEXT);
        });

        test('#04 => dispose', service[Symbol.asyncDispose].bind(service));
      });
    });
  });
});
