import { DELAY } from '#fixturesData';
import { hook } from './fixtures';

vi.useFakeTimers();

describe('TESTS', () => {
  const { service, useIterator, useNext, waiter, start } = hook();
  it(...start());
  it(...waiter(10));
  it(...useIterator(10));
  it(...useNext());
  it(...useIterator(10));
  it(...waiter(10));
  it(...useIterator(10));
  it(...useNext());
  it(...useIterator(10));
  it(...waiter(10));
  it(...useIterator(20));
  it(...useNext());

  it('#11 => Change DELAY', () => {
    service.addOptions(() => ({
      delays: {
        DELAY: DELAY / 2,
      },
    }));
  });

  it(...useNext());
  it(...waiter(10));
  it(...useIterator(40));
});
