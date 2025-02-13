import { t } from '@bemedev/types';
import type { StateValue } from '~states';
import { interpretTest } from '../interpreterTest';
import { DELAY, fakeDB, machine2 } from './activities.test.data';
import { fakeWaiter } from './fixtures';

beforeAll(() => {
  vi.useFakeTimers();
});

const TEXT = 'Activities Integration Test';

describe(TEXT, () => {
  const service = interpretTest(machine2, {
    pContext: {},
    context: { iterator: 0, input: '', data: [] },
  });

  const log = vi.spyOn(console, 'log');

  beforeAll(() => {
    console.time(TEXT);
  });

  // #region Hooks
  type SE = Parameters<typeof service.send>[0];

  const INPUT = 'a';

  const FAKES = fakeDB.filter(({ name }) => name.includes(INPUT));

  const useSend = (event: SE, index: number) => {
    const invite = `#${index < 10 ? '0' + index : index} => Send a "${(event as any).type ?? event}" event`;

    return t.tuple(invite, () => service.send(event));
  };

  const useWrite = (value: string, index: number) => {
    const invite = `#${index < 10 ? '0' + index : index} => Write "${value}"`;

    return t.tuple(invite, () =>
      service.send({ type: 'WRITE', payload: { value } }),
    );
  };

  const useWaiter = (times: number, index: number) => {
    const invite = `#${index < 10 ? '0' + index : index} => Wait ${times} times the delay`;

    return t.tuple(invite, () => fakeWaiter(DELAY, times));
  };

  const useState = (state: StateValue, index: number) => {
    const invite = `#${index < 10 ? '0' + index : index} => Current state is "${state}"`;
    return t.tuple(invite, () => {
      expect(service.value).toStrictEqual(state);
    });
  };

  const useIterator = (num: number, index: number) => {
    const invite = `#${index < 10 ? '0' + index : index} => iterator is "${num}"`;
    return t.tuple(invite, async () => {
      expect(service.context.iterator).toBe(num);
    });
  };

  const useInput = (input: string, index: number) => {
    const invite = `#${index < 10 ? '0' + index : index} => input is "${input}"`;
    return t.tuple(invite, async () => {
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

    return t.tuple(invite, func);
  };
  // #endregion

  test('#00 => Start the machine', () => {
    service.start();
  });

  test(...useWaiter(6, 1));

  describe('#02 => Check the service', () => {
    test(...useState('idle', 1));
    test(...useIterator(6, 2));
  });

  test(...useSend('NEXT', 3));

  describe('#04 => Check the service', () => {
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
  });

  test(...useWaiter(6, 5));

  test(...useIterator(18, 6));

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

    test(...useInput('', 3));
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

    test(...useInput('', 3));
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

    test(...useInput('', 3));
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

    test(...useInput('', 3));
  });

  test(...useWrite(INPUT, 22));

  describe('#23 => Check the service', () => {
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

    test(...useInput(INPUT, 3));
  });

  test(...useWaiter(6, 24));

  describe('#25 => Check the service', () => {
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

    test(...useInput(INPUT, 3));

    describe(...useData(4));
  });

  test(...useSend('FETCH', 26));

  test('#27 => Await the fetch', () => fakeWaiter());

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

    test(...useInput(INPUT, 3));

    describe(...useData(4, ...FAKES));
  });

  test(...useWaiter(6, 29));

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

    test(...useIterator(114, 2));

    test(...useInput(INPUT, 3));

    describe(...useData(4, ...FAKES));
  });

  test('#31 => Close the service', async () => {
    service.pause();
    expect(service.intervalsArePaused).toBe(true);

    expect(log).toBeCalledTimes(66);
    console.timeEnd(TEXT);
  });
});
