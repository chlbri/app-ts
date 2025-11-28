import { DELAY } from '#fixturesData';
import { interpret } from '#interpreter';
import { createMachine } from '#machine';
import { typings } from '#utils';
import tupleOf from '#bemedev/features/arrays/castings/tuple';
import { fakeWaiter } from '#fixtures';
import {
  DEFAULT_MAX_TIME_PROMISE,
  DEFAULT_MIN_ACTIVITY_TIME,
} from '#constants';

vi.useFakeTimers();

const useWaiter = (times: number, index: number) => {
  const invite = `#${index < 10 ? '0' + index : index} => Wait ${times} times the delay`;

  return tupleOf(invite, () => fakeWaiter(DELAY, times));
};

describe('DELAYS', () => {
  const machine1 = createMachine(
    {
      initial: 'idle',
      states: {
        idle: {
          activities: {
            DELAY: 'inc',
          },
          on: {
            NEXT: { description: 'Next', target: '/final' },
          },
        },
        final: {
          on: {
            NEXT: '/idle',
          },
        },
      },
    },
    typings({
      eventsMap: { NEXT: 'primitive' },
      promiseesMap: {},
      pContext: 'primitive',
      context: {
        iterator: 'number',
      },
    }),
  ).provideOptions(({ assign }) => ({
    actions: {
      inc: assign(
        'context.iterator',
        ({ context }) => context.iterator + 1,
      ),
    },
    delays: {
      DELAY,
    },
  }));

  const buildService = () =>
    interpret(machine1, {
      context: {
        iterator: 0,
      },
    });

  const hook = () => {
    const service = buildService();
    const useNext = (index: number) => {
      const invite = `#${index < 10 ? '0' + index : index} => Send "NEXT" event`;

      return tupleOf(invite, () => service.send('NEXT'));
    };

    const useIterator = (num: number, index: number) => {
      const invite = `#${index < 10 ? '0' + index : index} => iterator is "${num}"`;
      return tupleOf(invite, async () => {
        expect(service.select('iterator')).toBe(num);
      });
    };
    return {
      service,
      useNext,
      useIterator,
    };
  };

  describe('#01 => Change DELAY without errors', () => {
    const { service, useIterator, useNext } = hook();
    it('#00 => starts the service', service.start);
    it(...useWaiter(10, 2));
    it(...useIterator(10, 2));
    it(...useNext(3));
    it(...useIterator(10, 4));
    it(...useWaiter(10, 5));
    it(...useIterator(10, 6));
    it(...useNext(7));
    it(...useWaiter(10, 8));
    it(...useIterator(20, 9));
    it(...useNext(10));

    it('#11 => Change DELAY', () => {
      service.addOptions(() => ({
        delays: {
          DELAY: DELAY / 2,
        },
      }));
    });

    it(...useNext(12));
    it(...useWaiter(10, 13));
    it(...useIterator(40, 14));
  });

  describe('#02 => Change DELAY, DELAY too shore', () => {
    const { service, useIterator, useNext } = hook();
    it('#00 => starts the service', service.start);
    it(...useWaiter(10, 2));
    it(...useIterator(10, 2));
    it(...useNext(3));
    it(...useIterator(10, 4));
    it(...useWaiter(10, 5));
    it(...useIterator(10, 6));
    it(...useNext(7));
    it(...useWaiter(10, 8));
    it(...useIterator(20, 9));
    it(...useNext(10));

    it('#11 => Change DELAY', () => {
      service.addOptions(() => ({
        delays: {
          DELAY: DEFAULT_MIN_ACTIVITY_TIME / 2,
        },
      }));
    });
    it(...useNext(12));
    it(...useWaiter(10, 13));
    it(...useIterator(20, 14));
  });

  describe('#03 => Change DELAY, DELAY too long', () => {
    const { service, useIterator, useNext } = hook();
    it('#00 => starts the service', service.start);
    it(...useWaiter(10, 2));
    it(...useIterator(10, 2));
    it(...useNext(3));
    it(...useIterator(10, 4));
    it(...useWaiter(10, 5));
    it(...useIterator(10, 6));
    it(...useNext(7));
    it(...useWaiter(10, 8));
    it(...useIterator(20, 9));
    it(...useNext(10));

    it('#11 => Change DELAY', () => {
      service.addOptions(() => ({
        delays: {
          DELAY: DEFAULT_MAX_TIME_PROMISE + 1,
        },
      }));
    });

    it(...useNext(12));
    it(...useWaiter(10, 13));
    it(...useIterator(20, 14));
  });

  describe('#04 => Change DELAY, Cannot modify while using it', () => {
    const { service, useIterator, useNext } = hook();
    it('#00 => starts the service', service.start);
    it(...useWaiter(10, 2));
    it(...useIterator(10, 2));
    it(...useNext(3));
    it(...useIterator(10, 4));
    it(...useWaiter(10, 5));
    it(...useIterator(10, 6));
    it(...useNext(7));
    it(...useWaiter(10, 8));
    it(...useIterator(20, 9));

    it('#11 => Change DELAY', () => {
      service.addOptions(() => ({
        delays: {
          DELAY: DELAY - 10,
        },
      }));
    });

    it(...useWaiter(10, 13));
    it(...useIterator(30, 14));
    it(...useWaiter(10, 15));
    it(...useIterator(40, 16));
  });
});
