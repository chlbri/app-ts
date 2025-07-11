import { castings } from '@bemedev/types';
import equal from 'fast-deep-equal';
import { DELAY, fakeDB } from '~fixturesData';
import { interpret } from '~interpreter';
import type { StateValue } from '~states';
import { nothing } from '~utils';
import { machine22 } from '../data/machine22';
import { fakeWaiter } from '../fixtures';

beforeAll(() => {
  vi.useFakeTimers();
});

const TEXT = 'Activities Integration Test';

describe(TEXT, () => {
  // #region Config

  const service = interpret(machine22, {
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
      equals: (a, b) => equal(a.value, b.value),
    },
  );

  const dumbFn = vi.fn();
  const unsubscribe = service.subscribe(dumbFn);

  const log = vi.spyOn(console, 'log').mockImplementation(() => {});

  beforeAll(() => {
    console.time(TEXT);
  });

  type SE = Parameters<typeof service.send>[0];

  const INPUT = 'a';

  const FAKES = fakeDB.filter(({ name }) => name.includes(INPUT));

  const strings: (string | string[])[] = [];

  // #region Hooks

  const useSend = (event: SE, index: number) => {
    const invite = `#${index < 10 ? '0' + index : index} => Send a "${(event as any).type ?? event}" event`;

    return castings.arrays.tupleOf(invite, () => service.send(event));
  };

  const useWrite = (value: string, index: number) => {
    const invite = `#${index < 10 ? '0' + index : index} => Write "${value}"`;

    return castings.arrays.tupleOf(invite, () =>
      service.send({ type: 'WRITE', payload: { value } }),
    );
  };

  const useWaiter = (times: number, index: number) => {
    const invite = `#${index < 10 ? '0' + index : index} => Wait ${times} times the delay`;

    return castings.arrays.tupleOf(invite, () => fakeWaiter(DELAY, times));
  };

  const useState = (state: StateValue, index: number) => {
    const invite = `#${index < 10 ? '0' + index : index} => Current state is "${state}"`;
    return castings.arrays.tupleOf(invite, () => {
      expect(service.value).toStrictEqual(state);
    });
  };

  const useIterator = (num: number, index: number) => {
    const invite = `#${index < 10 ? '0' + index : index} => iterator is "${num}"`;
    return castings.arrays.tupleOf(invite, async () => {
      expect(service.select('iterator')).toBe(num);
    });
  };

  const useIteratorC = (num: number, index: number) => {
    const invite = `#${index < 10 ? '0' + index : index} => private iterator is "${num}"`;
    return castings.arrays.tupleOf(invite, async () => {
      expect(service._pSelect('iterator')).toBe(num);
    });
  };

  const useInput = (input: string, index: number) => {
    const invite = `#${index < 10 ? '0' + index : index} => input is "${input}"`;
    return castings.arrays.tupleOf(invite, async () => {
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

    return castings.arrays.tupleOf(invite, func);
  };

  const useConsole = (
    index: number,
    ..._strings: (string | string[])[]
  ) => {
    const inviteStrict = `#02 => Check strict string`;

    const strict = () => {
      const calls = strings.map(data => [data].flat());
      expect(log.mock.calls).toStrictEqual(calls);
    };

    const inviteLength = `#01 => Length of calls is : ${_strings.length}`;

    const length = () => {
      strings.push(..._strings);
      expect(log.mock.calls.length).toBe(strings.length);
    };

    const invite = `#${index < 10 ? '0' + index : index} => Check the console`;
    const func = () => {
      test(inviteLength, length);
      test(inviteStrict, strict);
    };

    return castings.arrays.tupleOf(invite, func);
  };
  // #endregion

  // #endregion

  test('#00 => Start the machine', () => {
    service.start();
  });

  test(...useWaiter(6, 1));

  describe('#02 => Check the service', () => {
    test(...useState('idle', 1));
    test(...useIterator(6, 2));
    test(...useIteratorC(6, 3));
    describe(...useConsole(4));
  });

  test(...useSend('NEXT', 3));

  describe('#05 => Check the service', () => {
    test(
      ...useState(
        {
          working: {
            fetch: 'idle',
            ui: 'idle',
          },
        },
        1,
      ),
    );

    test(...useIterator(6, 2));
    test(...useIteratorC(6, 3));

    describe(...useConsole(4, 'NEXT time, you will see!!'));
  });

  test(...useWaiter(6, 5));

  describe('#06 => Check the service', () => {
    test(...useIterator(18, 1));
    test(...useIteratorC(12, 2));
    describe(...useConsole(3, ...Array(6).fill('sendPanelToUser')));
  });

  test('#07 => pause', service.pause.bind(service));

  describe('#08 => Check the service', () => {
    test(
      ...useState(
        {
          working: {
            fetch: 'idle',
            ui: 'idle',
          },
        },
        1,
      ),
    );

    test(...useIterator(18, 2));
    test(...useIteratorC(12, 3));

    describe(...useConsole(4));
  });

  test(...useWaiter(6, 9));

  describe('#10 => Check the service', () => {
    test(
      ...useState(
        {
          working: {
            fetch: 'idle',
            ui: 'idle',
          },
        },
        1,
      ),
    );

    test(...useIterator(18, 2));
    test(...useIteratorC(12, 3));

    describe(...useConsole(4));
  });

  test('#11 => resume', service.resume.bind(service));

  test(...useWaiter(12, 12));

  describe('#13 => Check the service', () => {
    test(
      ...useState(
        {
          working: {
            fetch: 'idle',
            ui: 'idle',
          },
        },
        1,
      ),
    );

    test(...useIterator(42, 2));
    test(...useIteratorC(24, 3));

    describe(...useConsole(4, ...Array(12).fill('sendPanelToUser')));
  });

  test(...useWrite('', 14));

  describe('#15 => Check the service', () => {
    test(
      ...useState(
        {
          working: {
            fetch: 'idle',
            ui: 'input',
          },
        },
        1,
      ),
    );

    test(...useIterator(42, 2));
    test(...useIteratorC(24, 3));
    test(...useInput('', 4));
    describe(...useConsole(5, ['WRITE with', ':', '""']));
  });

  test(...useWaiter(12, 16));

  describe('#17 => Check the service', () => {
    test(
      ...useState(
        {
          working: {
            fetch: 'idle',
            ui: 'input',
          },
        },
        1,
      ),
    );

    test(...useIterator(66, 2));
    test(...useIteratorC(36, 3));
    test(...useInput('', 4));

    describe(
      ...useConsole(
        5,
        ...Array(24)
          .fill(0)
          .map((_, index) => {
            const isEven = index % 2 === 0;
            return isEven ? 'sendPanelToUser' : 'Input, please !!';
          }),
      ),
    );
  });

  test(...useWrite(INPUT, 18));

  describe('#19 => Check the service', () => {
    test(
      ...useState(
        {
          working: {
            fetch: 'idle',
            ui: 'idle',
          },
        },
        1,
      ),
    );

    test(...useIterator(66, 2));
    test(...useIteratorC(36, 3));
    test(...useInput('', 4));
    describe(...useConsole(5, ['WRITE with', ':', `"${INPUT}"`]));
  });

  test(...useWaiter(12, 20));

  describe('#21 => Check the service', () => {
    test(
      ...useState(
        {
          working: {
            fetch: 'idle',
            ui: 'idle',
          },
        },
        1,
      ),
    );

    test(...useIterator(90, 2));
    test(...useIteratorC(48, 3));
    test(...useInput('', 4));
    describe(...useConsole(5, ...Array(12).fill('sendPanelToUser')));
  });

  test('#22 => Close the subscriber', subscriber.close.bind(subscriber));

  test(...useWrite(INPUT, 23));

  describe('#24 => Check the service', () => {
    test(
      ...useState(
        {
          working: {
            fetch: 'idle',
            ui: 'input',
          },
        },
        1,
      ),
    );

    test(...useIterator(90, 2));
    test(...useIteratorC(48, 3));
    test(...useInput(INPUT, 4));
    describe(...useConsole(5));
  });

  test(...useWaiter(6, 25));

  describe('#26 => Check the service', () => {
    test(
      ...useState(
        {
          working: {
            fetch: 'idle',
            ui: 'input',
          },
        },
        1,
      ),
    );

    test(...useIterator(102, 2));
    test(...useIteratorC(54, 3));
    test(...useInput(INPUT, 4));
    describe(...useData(5));
    describe(...useConsole(6, ...Array(6).fill('sendPanelToUser')));
  });

  test(...useSend('FETCH', 27));

  describe('#28 => Check the service', () => {
    test(
      ...useState(
        {
          working: {
            fetch: 'idle',
            ui: 'input',
          },
        },
        1,
      ),
    );

    test(...useIterator(102, 2));
    test(...useIteratorC(54, 3));
    test(...useInput(INPUT, 4));
    describe(...useData(5, ...FAKES));
    describe(...useConsole(6));
  });

  test('#29 => Await the fetch', () => fakeWaiter());

  describe('#30 => Check the service', () => {
    test(
      ...useState(
        {
          working: {
            fetch: 'idle',
            ui: 'input',
          },
        },
        1,
      ),
    );

    test(...useIterator(102, 2));
    test(...useIteratorC(54, 3));
    test(...useInput(INPUT, 4));
    describe(...useData(5, ...FAKES));
    describe(...useConsole(5));
  });

  test(...useWaiter(6, 31));

  describe('#32 => Check the service', () => {
    test(
      ...useState(
        {
          working: {
            fetch: 'idle',
            ui: 'input',
          },
        },
        1,
      ),
    );

    test(...useIterator(114, 2));
    test(...useIteratorC(60, 3));
    test(...useInput(INPUT, 4));
    describe(...useData(5, ...FAKES));
    describe(...useConsole(6, ...Array(6).fill('sendPanelToUser')));
  });

  describe('#33 => Close the service', async () => {
    test('#01 => Pause the service', service.pause.bind(service));

    describe('#02 => Calls of log', () => {
      test('#01 => Length of calls of log is the same of length of strings', () => {
        expect(log).toBeCalledTimes(strings.length);
      });

      test('#02 => Log is called "69" times', () => {
        expect(log).toBeCalledTimes(69);
      });
    });

    test('#03 => Length of calls of dumbFn is "218"', () => {
      expect(dumbFn).toBeCalledTimes(218);
      unsubscribe.unsubscribe();
    });

    test('#04 => Log the time of all tests', () => {
      console.timeEnd(TEXT);
    });

    test('#05 => dispose', service[Symbol.asyncDispose].bind(service));
  });
});
