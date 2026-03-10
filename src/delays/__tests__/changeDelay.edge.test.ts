import { DELAY } from '#fixturesData';
import { hook } from './fixtures';

vi.useFakeTimers();

describe('Change not possible while using the DELAY', () => {
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
        DELAY: DELAY - 30,
      },
    }));
  });

  it(...waiter(10));
  it(...useIterator(30));
  it(...waiter(10));
  it(...useIterator(40));
});
