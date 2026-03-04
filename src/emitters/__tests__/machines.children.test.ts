import tupleOf from '#bemedev/features/arrays/castings/tuple';
import { interpret } from '#interpreter';
import { createFakeWaiter } from '@bemedev/vitest-extended';
import { machineEmitter3, WAITERS } from './machines';

vi.useFakeTimers();
describe('#01 => Emitter Machine1', () => {
  const service = interpret(machineEmitter3);
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
    test(...useContext(5, 8));
    test(...waiter(10, 1));
    test(...useContext(30, 11));
    test(...useNext(12));
    test('#13 => Pause', service.pause);
    test(...waiter(14, 10));
    test(...useContext(30, 15));
    test('#16 => Resume', service.resume);
    test(...waiter(17, 1));
    test(...useContext(30, 18));
    test(...useNext(19));
    test(...waiter(20));
    test(...useContext(30, 21));
    test(...useNext(22));
    test(...waiter(23));
    test(...useContext(30, 24));
    test(...useNext(25));
    test(...waiter(26));
    test(...useContext(50, 27));
    test(...useNext(28));
    test(...waiter(29));
    test(...useContext(50, 30));
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

describe('#01 => Emitter Machine1', () => {
  const service = interpret(machineEmitter3);
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
    test(...waiter(6));
    test(...useContext(15, 7));
    test(...waiter(8));
    test(...useContext(30, 9));
    test(...waiter(10));
    test(...useContext(50, 11));
    test(...waiter(12));
    test(...useContext(75, 13));
    test('#14 => Stop', service.stop);
  });
});
