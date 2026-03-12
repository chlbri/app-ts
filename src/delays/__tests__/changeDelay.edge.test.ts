import { DEFAULT_MAX_TIME_PROMISE } from '#constants';
import { DELAY } from '#fixturesData';
import { hook } from './fixtures';

vi.useFakeTimers();

describe('#01 => Change not possible while using the DELAY', () => {
  const { service, useIterator, useNext, waiter, start } = hook();
  it(...start());
  it(...waiter(10));
  it(...useIterator(10));
  it(...useNext());
  it(...useIterator(10));
  it(...waiter(10));
  it(...useIterator(10));
  it(...useNext());
  it(...waiter(10));
  it(...useIterator(20));

  it('#11 => Try change DELAY, but cannot', () => {
    service.addOptions(() => ({
      delays: {
        DELAY: DELAY / 5,
      },
    }));
  });

  it(...waiter(10));
  it(...useIterator(30));
  it(...waiter(10));
  it(...useIterator(40));
});

describe('#02 => Change to not allowed value', () => {
  const { service, useIterator, useNext, waiter, start } = hook();
  it(...start());
  it(...waiter(10));
  it(...useIterator(10));
  it(...useNext());
  it(...useIterator(10));
  it(...waiter(10));
  it(...useIterator(10));
  it(...useNext());
  it(...waiter(10));
  it(...useIterator(20));
  it(...useNext());

  it('#11 => Try change DELAY, but cannot', () => {
    service.addOptions(() => ({
      delays: {
        DELAY: DEFAULT_MAX_TIME_PROMISE * 5,
      },
    }));
  });

  it(...waiter(10));
  it(...useIterator(20));
  it(...useNext());
  it(...waiter(100));
  it(...useIterator(20));
});
