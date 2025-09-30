import tupleOf from '#bemedev/features/arrays/castings/tuple';
import { interpret } from '#interpreter';
import { createFakeWaiter } from '@bemedev/vitest-extended';
import { machineEmitter3, WAITERS } from './machines';

vi.useFakeTimers();
describe('#01 => Emitter Machine1', () => {
  const service = interpret(machineEmitter3, { context: 0 });
  const waiter = createFakeWaiter.withDefaultDelay(vi, WAITERS.short);

  const useContext = (num: number, index: number) => {
    const invite = `#${index} => context is "${num}"`;
    return tupleOf(invite, () => expect(service.context).toBe(num));
  };

  const useNext = (index: number) => {
    const invite = `#${index} => send "NEXT"`;
    return tupleOf(invite, () => service.send('NEXT'));
  };

  describe('TESTS', () => {
    test('#0 => start', service.start);
    test(...waiter(1));
    test(...useContext(0, 2));
    test(...useNext(3));
    test(...waiter(4));
    test(...useContext(5, 5));
    test(...useNext(6));
    test(...waiter(7));
    test(...useContext(5, 8));
    test(...useNext(9));
    test(...waiter(10));
    test(...useContext(10, 11));
    test(...useNext(12));
    test('#13 => Pause', service.pause);
    test(...waiter(14, 10));
    test(...useContext(10, 15));
    test('#16 => Resume', service.resume);
    test(...waiter(17, 1));
    test(...useContext(10, 18));
    test(...useNext(19));
    test(...waiter(20));
    test(...useContext(15, 21));
    test(...useNext(22));
    test(...waiter(23));
    test(...useContext(15, 24));
    test(...useNext(25));
    test(...waiter(26));
    test(...useContext(20, 27));
    test(...useNext(28));
    test(...waiter(29));
    test(...useContext(20, 30));
    test(...useNext(31));
    test(...waiter(32, 5));
    test(...useContext(95, 33));
    test(...waiter(34, 25));
    test(...useContext(95, 35));
    test('#36 => Resume', service.resume);
    test(...waiter(37, 5));
    test('#38 => Stop', service.stop);
  });
});
