import { interpret } from '#interpreter';
import { castings } from '@bemedev/types';
import { createFakeWaiter } from '@bemedev/vitest-extended';
import { machineEmitter1, WAITERS } from './machine1.machine';

// vi.useFakeTimers();
describe('#01 => Emitter Machine1', () => {
  const service = interpret(machineEmitter1);
  const waiter = createFakeWaiter.withDefaultDelay(vi, WAITERS.short);

  const useContext = (num: number, index: number) => {
    const invite = `#${index} => context is "${num}"`;
    return castings.arrays.tupleOf(invite, async () => {
      expect(service.context).toBe(num);
    });
  };

  test('#0 => start', service.start);

  test(...waiter(1));

  test(...useContext(5, 2));

  test(...waiter(3));

  test(...useContext(10, 4));

  test(...waiter(5));

  test(...useContext(15, 6));

  test(...waiter(7));

  test(...useContext(20, 8));

  test(...waiter(9));

  test(...useContext(25, 10));
});
