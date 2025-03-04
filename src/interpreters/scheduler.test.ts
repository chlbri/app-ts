import { Scheduler } from './scheduler';

describe('scheduler - coverage', () => {
  const scheduler = new Scheduler();
  const fn = vi.fn();

  test('#01 => Initialize', () => {
    scheduler.initialize(fn);
  });

  test('#02 => Check fn -> is called', () => {
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('#03 => Initialize again', () => {
    scheduler.initialize(fn);
  });

  test('#04 => Check fn -> is not called', () => {
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('#05 => schedule', () => {
    scheduler.schedule(fn);
  });

  test('#06 => Check fn -> is not called', () => {
    expect(fn).toHaveBeenCalledTimes(2);
  });

  test('#07 => schedule again', () => {
    scheduler.schedule(fn);
  });

  test('#08 => Check fn -> is not called', () => {
    expect(fn).toHaveBeenCalledTimes(3);
  });

  test('#09 => stop', () => {
    scheduler.stop();
  });

  test('#10 => schedule', () => {
    scheduler.schedule(fn);
  });

  test('#11 => Check fn -> is not called', () => {
    expect(fn).toHaveBeenCalledTimes(3);
  });

  test('#12 => schedule again', () => {
    scheduler.schedule(fn);
  });

  test('#13 => Check fn -> is not called', () => {
    expect(fn).toHaveBeenCalledTimes(3);
  });
});
