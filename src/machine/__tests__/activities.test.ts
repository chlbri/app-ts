import { interpretTest } from '../interpreterTest';
import { DELAY, fakeDB, machine1, machine2 } from './activities.test.data';
import { fakeWaiter } from './fixtures';

const log = vi.spyOn(console, 'log');

beforeAll(() => {
  vi.useFakeTimers();
});

const isCI = process.env.CI === 'true';

describe.skipIf(isCI)('#1 => First state has activity', () => {
  const service = interpretTest(machine1, {
    pContext: {},
    context: { iterator: 0 },
  });

  test('#0 => start the service', () => {
    service.start();
    expect(service.context.iterator).toBe(0);
  });

  test('#1 => Await one delay -> iterator = 1', async () => {
    await fakeWaiter(DELAY);
    expect(service.context.iterator).toBe(1);
  });

  test('#2 => Await one delay -> iterator = 2', async () => {
    await fakeWaiter(DELAY);
    expect(service.context.iterator).toBe(2);
  });

  test('#3 => Await twice delay -> iterator = 4', async () => {
    await fakeWaiter(DELAY, 2);
    expect(service.context.iterator).toBe(4);
  });

  test('#4 => Await six times delay -> iterator = 10', async () => {
    await fakeWaiter(DELAY, 6);
    expect(service.context.iterator).toBe(10);
  });

  test('#5 => Send NEXT and await 3 times -> iterator = 10, remains the same', async () => {
    service.send({ type: 'NEXT', payload: {} });
    await fakeWaiter(DELAY, 3);
    expect(service.context.iterator).toBe(10);
  });
});

describe.skipIf(isCI)('#2 => Complex', () => {
  const service = interpretTest(machine2, {
    pContext: {},
    context: { iterator: 0, input: '', data: [] },
  });

  test('#00 => start the service', () => {
    service.start();
    expect(service.context.iterator).toBe(0);
  });

  test('#01 => Await one delay -> iterator = 1', async () => {
    await fakeWaiter(DELAY);
    expect(log).not.toBeCalled();
    expect(service.context.iterator).toBe(1);
  });

  test('#02 => Send Next', () => {
    service.send({ type: 'NEXT', payload: {} });
  });

  describe('#03 => Await twice delay', () => {
    test('#00 => Wait', () => fakeWaiter(DELAY, 2));

    test('#01 => iterator = 5', async () => {
      expect(service.context.iterator).toBe(5);
    });

    describe('#02 => console.log is called', () => {
      test('#01 => console.log is called', () => {
        expect(log).toBeCalled();
      });

      test('#02 => console.log is called with sendPanelToUser twice', () => {
        expect(log).toHaveBeenNthCalledWith(2, 'sendPanelToUser');
        expect(log).toHaveBeenCalledTimes(2);
        log.mockClear();
      });
    });
  });

  describe('#04 => Await four delays', () => {
    test('#00 => Wait', () => fakeWaiter(DELAY, 4));

    test('#01 => iterator = 13', async () => {
      expect(service.context.iterator).toBe(13);
    });

    describe('#02 => console.log is called', () => {
      test('#01 => console.log is called', () => {
        expect(log).toBeCalled();
      });

      test('#02 => console.log is called with sendPanelToUser 4 times', () => {
        expect(log).toHaveBeenNthCalledWith(4, 'sendPanelToUser');
        expect(log).toHaveBeenCalledTimes(4);
        log.mockClear();
      });
    });
  });

  test('#05 => Send WRITE', () => {
    service.send({ type: 'WRITE', payload: { value: 'a' } });
  });

  describe('#06 => Context input is modified', () => {
    test('#01 => input is not empty', () => {
      expect(service.context.input).toBeDefined();
      expect(service.context.input).not.toBe('');
    });

    test('#02 => input = a', () => {
      expect(service.context.input).toBe('a');
    });
  });

  describe('#07 => Await four delays', () => {
    test('#00 => Wait', () => fakeWaiter(DELAY, 4));

    test('#01 => iterator = 13', async () => {
      expect(service.context.iterator).toBe(21);
    });

    describe('#02 => console.log is called', () => {
      test('#01 => console.log is called', () => {
        expect(log).toBeCalled();
      });

      test('#02 => console.log is called with sendPanelToUser 4 times', () => {
        expect(log).toHaveBeenNthCalledWith(4, 'sendPanelToUser');
        expect(log).toHaveBeenCalledTimes(4);
        log.mockClear();
      });
    });
  });

  test('#08 => Send FETCH', async () => {
    service.send('FETCH');
  });

  test('#09 => Wait for promise', () => fakeWaiter());

  describe('#10 => Data is inserted', () => {
    test('#01 => Data is not empty', () => {
      expect(service.context.data).toBeDefined();
      expect(service.context.data).not.toHaveLength(0);
    });

    test('#02 => Data has length of 17', () => {
      expect(service.context.data).toHaveLength(17);
    });

    test('#03 => Data has the right values', () => {
      const expected = fakeDB.filter(item => item.name.includes('a'));
      expect(service.context.data).toStrictEqual(expected);
    });
  });

  describe('#10 => Await four delays', () => {
    test('#00 => Wait', () => fakeWaiter(DELAY, 4));

    test('#01 => iterator = 13', async () => {
      expect(service.context.iterator).toBe(29);
    });

    test('#02 => console.log is not called', () => {
      expect(log).not.toBeCalled();
    });
  });

  test('#11 => Send WRITE', () => {
    service.send({ type: 'WRITE', payload: { value: '' } });
  });

  test('#12 => Send WRITE again', () => {
    service.send({ type: 'WRITE', payload: { value: '' } });
  });

  describe('#13 => Await four delays', () => {
    test('#00 => Wait', () => fakeWaiter(DELAY, 4), 10_000);

    test('#01 => iterator = 13', async () => {
      expect(service.context.iterator).toBe(37);
    });

    describe('#02 => console.log is called', () => {
      test('#01 => console.log is called', () => {
        expect(log).toBeCalled();
      });

      test('#02 => console.log is called with sendPanelToUser 4 times', () => {
        expect(log).toHaveBeenCalledTimes(4);
        expect(log).toHaveBeenNthCalledWith(4, 'Input, please !!');
        log.mockClear();
      });
    });
  });

  test('#14 => Pause the service', () => {
    service.pause();
  });
});
