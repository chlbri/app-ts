import tupleOf from '#bemedev/features/arrays/castings/tuple';
import { interpret } from '#interpreter';
import { fakeWaiter } from '../fixtures';
import { DELAY } from './constants';
import { fakeDB } from './fakeDB';
import { machine23 } from './machine23';

describe('Machine 23 -> Tests for inner machines', () => {
  beforeAll(() => vi.useFakeTimers());

  const service = interpret(machine23, {
    pContext: {
      iterator: 0,
    },
    context: { iterator: 0, input: '', data: [] },
  });

  type SE = Parameters<typeof service.send>[0];

  const INPUT = 'a';

  const FAKES = fakeDB.filter(({ name }) => name.includes(INPUT));

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

  const useIteratorC = (num: number, index: number) => {
    const invite = `#${index < 10 ? '0' + index : index} => iterator is "${num}"`;
    return tupleOf(invite, async () => {
      expect(service._pSelect('iterator')).toBe(num);
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

  test('#00 => Start the machine', service.start);
  test(...useWaiter(6, 1));
  test(...useIterator(6, 2));
  test(...useIteratorC(0, 3));
  test(...useSend('NEXT', 4));
  test(...useIterator(6, 5));
  test(...useWaiter(6, 6));
  test(...useIteratorC(6, 7));
  test(...useIterator(18, 8));
  test('#09 => pause', service.pause);
  test(...useIterator(18, 10));
  test(...useWaiter(6, 11));
  test(...useIterator(18, 12));
  test('#13 => resume', service.resume);
  test(...useWaiter(12, 14));
  test(...useIterator(42, 15));
  test(...useIteratorC(18, 16));
  test(...useWrite('', 17));

  describe('#18 => Check the service', () => {
    test(...useIterator(42, 1));
    test(...useIteratorC(18, 2));
    test(...useInput('', 3));
  });

  test(...useWaiter(12, 19));

  describe('#20 => Check the service', () => {
    test(...useIterator(66, 1));
    test(...useIteratorC(18, 2));
    test(...useInput('', 3));
  });

  test(...useWrite(INPUT, 21));

  describe('#22 => Check the service', () => {
    test(...useIterator(66, 1));
    test(...useIteratorC(18, 2));
    test(...useInput('', 3));
  });

  test(...useWaiter(12, 23));

  describe('#24 => Check the service', () => {
    test(...useIterator(90, 1));
    test(...useIteratorC(30, 2));
    test(...useInput('', 3));
  });

  test(...useWrite(INPUT, 25));

  describe('#26 => Check the service', () => {
    test(...useIterator(90, 1));
    test(...useIteratorC(30, 2));
    test(...useInput(INPUT, 3));
  });

  test(...useWaiter(6, 27));

  describe('#28 => Check the service', () => {
    test(...useIterator(102, 1));
    test(...useIteratorC(30, 2));
    test(...useInput(INPUT, 3));
    describe(...useData(4));
  });

  test(...useSend('FETCH', 29));

  describe('#30 => Check the service', () => {
    test(...useIterator(102, 1));
    test(...useIteratorC(30, 2));
    test(...useInput(INPUT, 3));
    describe(...useData(4, ...FAKES));
  });

  test(...useWaiter(6, 31));

  describe('#32 => Check the service', () => {
    test(...useIterator(114, 1));
    test(...useIteratorC(30, 2));
    test(...useInput(INPUT, 3));
    describe(...useData(4, ...FAKES));
  });

  test(...useSend('FINISH', 33));
  test('#34 => Wait for debounce', () => {
    vi.advanceTimersByTime(10_000);
  });

  test(...useIterator(1000, 35));

  test('#36 => Stop the service', service.stop);
});
