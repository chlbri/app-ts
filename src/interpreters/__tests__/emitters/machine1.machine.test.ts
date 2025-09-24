import tupleOf from '#bemedev/features/arrays/castings/tuple';
import { interpret } from '#interpreter';
import { createFakeWaiter } from '@bemedev/vitest-extended';
import { machineEmitter1, WAITERS } from './machine1.machine';

vi.useFakeTimers();
describe('#01 => Emitter Machine1', () => {
  const service = interpret(machineEmitter1, { context: 0 });
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
    test(...useContext(5, 2));
    test(...useNext(3));
    test(...waiter(4));
    test(...useContext(15, 5));
    test(...useNext(6));
    test(...waiter(7));
    test(...useContext(30, 8));
    test(...useNext(9));
    test(...waiter(10));
    test(...useContext(50, 11));
    test(...useNext(12));
    test('#13 => Pause', service.pause);
    test(...waiter(14, 10));
    test(...useContext(50, 15));
    test('#16 => Resume', service.resume);
    test(...waiter(17, 1));
    test(...useContext(55, 18));
    test(...useNext(19));
    test(...waiter(20));
    test(...useContext(65, 21));
    test(...useNext(22));
    test(...waiter(23));
    test(...useContext(80, 24));
    test(...useNext(25));
    test(...waiter(26));
    test(...useContext(100, 27));
    test(...useNext(28));
    test(...waiter(29));
    test(...useContext(125, 30));
    test(...useNext(31));
    test(...waiter(32, 10));
    test(...useContext(125, 33));
    test('#34 => Resume', service.resume);
    test(...waiter(35, 5));
    test('#36 => Stop', service.stop);
  });
});
