import { interpret } from '#interpreter';
import { castings } from '@bemedev/types';
import { createFakeWaiter } from '@bemedev/vitest-extended';
import { machineEmitter1, WAITERS } from './machine1.machine';

vi.useFakeTimers();
describe('#01 => Emitter Machine1', () => {
  const service = interpret(machineEmitter1, { context: 0 });
  const waiter = createFakeWaiter.withDefaultDelay(vi, WAITERS.short);

  const useContext = (num: number, index: number) => {
    const invite = `#${index} => context is "${num}"`;
    return castings.arrays.tupleOf(invite, () =>
      expect(service.context).toBe(num),
    );
  };

  const useNext = (index: number) => {
    const invite = `#${index} => send "NEXT"`;
    return castings.arrays.tupleOf(invite, () => service.send('NEXT'));
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
    test(...waiter(13));
    test(...useContext(75, 14));
    test(...useNext(15));
    test('#16 => Pause', service.pause);
    test(...waiter(17, 10));
    test(...useContext(75, 17));
    test('#18 => Resume', service.resume);
    test(...waiter(19, 1));
    test(...useContext(80, 20));
    test(...useNext(21));
    test(...waiter(22));
    test(...useContext(90, 23));
    test(...useNext(24));
    test(...waiter(25));
    test(...useContext(105, 26));
    test(...useNext(27));
    test(...waiter(28));
    test(...useContext(125, 29));
    test(...useNext(30));
    test(...waiter(31));
    test(...useContext(150, 32));
    test(...useNext(33));
    test(...waiter(34, 10));
    test(...useContext(150, 35));
    test('#36 => Stop', service.stop);
  });
});
