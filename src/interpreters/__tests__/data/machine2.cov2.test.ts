import tupleOf from '#bemedev/features/arrays/castings/tuple';
import { _machine2, DELAY, fakeDB } from '#fixturesData';
import { interpret } from '#interpreters';
import { nothing } from '#utils';
import equal from 'fast-deep-equal';
import { fakeWaiter } from '#fixtures';

describe('machine coverage', () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  describe('#01 => Integration', () => {
    const TEXT =
      '#02 => Activities Integration Test from perform -> stop before set to 1000';

    describe(TEXT, () => {
      // #region Config

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

      type SE = Parameters<typeof service.send>[0];

      const INPUT = 'a';

      const FAKES = fakeDB
        .filter(({ name }) => name.includes(INPUT))
        .map(({ name }) => name);

      // #region Hooks

      const useSend = (event: SE, index: number) => {
        const invite = `#${index < 10 ? '0' + index : index} => Send a "${(event as any).type ?? event}" event`;

        return tupleOf(invite, () => service.send(event));
      };

      const useWrite = (value: string, index: number) => {
        const invite = `#${index < 10 ? '0' + index : index} => Write "${value}"`;

        return tupleOf(invite, () =>
          service.send({ type: 'WRITE', payload: { value } }),
        );
      };

      const useWaiter = (times: number, index: number) => {
        const invite = `#${index < 10 ? '0' + index : index} => Wait ${times} times the delay`;

        return tupleOf(invite, () => fakeWaiter(DELAY, times));
      };

      const useIterator = (num: number, index: number) => {
        const invite = `#${index < 10 ? '0' + index : index} => iterator is "${num}"`;
        return tupleOf(invite, async () => {
          expect(service.select('iterator')).toBe(num);
        });
      };

      const useInput = (input: string, index: number) => {
        const invite = `#${index < 10 ? '0' + index : index} => input is "${input}"`;
        return tupleOf(invite, async () => {
          expect(service.context.input).toBe(input);
        });
      };

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

      // #endregion

      // #endregion

      test('#00 => Start the machine', () => {
        service.start();
      });

      test(...useWaiter(6, 1));

      describe('#02 => Check the service', () => {
        test(...useIterator(6, 2));
      });

      test(...useSend('NEXT', 3));

      describe('#05 => Check the service', () => {
        test(...useIterator(6, 2));
      });

      test(...useWaiter(6, 5));

      describe('#06 => Check the service', () => {
        test(...useIterator(18, 1));
      });

      test('#07 => pause', service.pause.bind(service));

      describe('#08 => Check the service', () => {
        test(...useIterator(18, 2));
      });

      test(...useWaiter(6, 9));

      describe('#10 => Check the service', () => {
        test(...useIterator(18, 2));
      });

      test('#11 => resume', service.resume.bind(service));

      test(...useWaiter(12, 12));

      describe('#13 => Check the service', () => {
        test(...useIterator(42, 2));
      });

      test(...useWrite('', 14));

      describe('#15 => Check the service', () => {
        test(...useIterator(42, 2));
        test(...useInput('', 4));
      });

      test(...useWaiter(12, 16));

      describe('#17 => Check the service', () => {
        test(...useIterator(66, 2));
        test(...useInput('', 4));
      });

      test(...useWrite(INPUT, 18));

      describe('#19 => Check the service', () => {
        test(...useIterator(66, 2));
        test(...useInput('', 4));
      });

      test(...useWaiter(12, 20));

      describe('#21 => Check the service', () => {
        test(...useIterator(90, 2));
        test(...useInput('', 4));
      });

      test(
        '#22 => Close the subscriber',
        subscriber.close.bind(subscriber),
      );

      test(...useWrite(INPUT, 23));

      describe('#24 => Check the service', () => {
        test(...useIterator(90, 2));
        test(...useInput(INPUT, 4));
      });

      test(...useWaiter(6, 25));

      describe('#26 => Check the service', () => {
        test(...useIterator(102, 2));
        test(...useInput(INPUT, 4));
        describe(...useData(5));
      });

      test(...useSend('FETCH', 27));

      describe('#28 => Check the service', () => {
        test(...useIterator(102, 2));
        test(...useInput(INPUT, 4));
        describe(...useData(5, ...FAKES));
      });

      test('#29 => Await the fetch', () => fakeWaiter());

      describe('#30 => Check the service', () => {
        test(...useIterator(102, 2));
        test(...useInput(INPUT, 4));
        describe(...useData(5, ...FAKES));
      });

      test(...useWaiter(6, 31));

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
        test(...useIterator(114, 2));
      });

      describe('#35 => Close the service', async () => {
        test('#01 => Pause the service', service.pause.bind(service));

        test('#02 => Log the time of all tests', () => {
          console.timeEnd(TEXT);
        });

        test('#03 => dispose', service[Symbol.asyncDispose]);
      });

      test('#36 => Wait for debounce', () => {
        vi.advanceTimersByTime(10_000);
      });

      test(...useIterator(114, 37));
    });
  });
});
