import { t } from '@bemedev/types';
import { createFakeWaiter } from '@bemedev/vitest-extended';
import { interpret } from '~interpreter';
import { createMachine } from '~machine';
import { EVENTS_FULL } from '~machines';
import { defaultC, defaultT } from './fixtures';

describe('Integration testing for interpret, Children', () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  const child = createMachine(
    {
      states: {
        idle: {
          activities: { DELAY: 'inc' },
        },
      },
    },
    { ...defaultT, context: t.number },
    { '/': 'idle' },
  ).provideOptions(() => ({
    actions: {
      inc: (pContext, context) => {
        return { pContext, context: context + 1 };
      },
    },
    delays: { DELAY: 100 },
  }));

  describe('#01 => context are same', () => {
    const parent = createMachine(
      {
        machines: 'child',
        states: {
          idle: {},
        },
      },
      { ...defaultT, pContext: t.number },
      { '/': 'idle' },
    ).provideOptions(({ createChild }) => ({
      machines: {
        child: createChild(
          child,
          {
            context: 0,
            pContext: {},
          },
          {
            events: EVENTS_FULL,
          },
        ),
      },
    }));

    const service = interpret(parent, {
      ...defaultC,
      pContext: 0,
    });

    const useIterator = (index: number, value: number) => {
      const count = index > 10 ? '' + index : `0${index}`;
      const invite = `#${count} => iterator is (${value})`;
      const fn = () => {
        expect(service.pContext).toBe(value);
      };

      return [invite, fn] as const;
    };

    const useWaiter = createFakeWaiter.withDefaultDelay(vi, 100);

    test('#01 => start the service', () => {
      service.start();
    });

    test(...useIterator(2, 0));
    test(...useWaiter(3));
    test(...useIterator(4, 1));
    test(...useWaiter(5));
    test(...useIterator(6, 2));
  });

  describe('#02 => context of child, and the type correspond to a subtype of privateContext of parent', () => {
    const parent = createMachine(
      {
        machines: 'child',
        states: {
          idle: {},
          working: {
            on: {
              NEXT: '/idle',
            },
          },
        },
      },
      {
        ...defaultT,
        pContext: { iterator: t.number },
        eventsMap: { NEXT: {} },
      },
      { '/': 'idle' },
    ).provideOptions(({ createChild }) => ({
      machines: {
        child: createChild(
          child,
          {
            context: 0,
            pContext: {},
          },
          {
            events: EVENTS_FULL,
            contexts: 'iterator',
          },
        ),
      },
    }));

    const service = interpret(parent, {
      ...defaultC,
      pContext: { iterator: 0 },
    });

    const useIterator = (index: number, value: number) => {
      const count = index > 10 ? '' + index : `0${index}`;
      const invite = `#${count} => iterator is (${value})`;
      const fn = () => {
        expect(service.pSelect('iterator')).toBe(value);
      };

      return [invite, fn] as const;
    };

    const useWaiter = createFakeWaiter.withDefaultDelay(vi, 100);

    test('#01 => start the service', () => {
      service.start();
    });

    test(...useIterator(2, 0));
    test(...useWaiter(3));
    test(...useIterator(4, 1));
    test(...useWaiter(5));
    test(...useIterator(6, 2));
    test('#07 => send NEXT event', () => {
      service.send('NEXT');
    });
  });
});
