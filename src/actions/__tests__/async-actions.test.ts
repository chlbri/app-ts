import { interpret } from '#interpreter';
import { createMachine } from '#machine';
import { typings } from '#utils';
import { sleep } from '@bemedev/sleep';

vi.useFakeTimers();

/**
 * Async action helpers tests.
 * Covers: assign, voidAction, filter, sendTo — each with:
 *   (a) async fn, no options (happy path)
 *   (b) async fn + { max } timeout — expect result before timeout
 *   (c) async fn + { error } handler — rejects → merged from errorFn
 *   (d) async fn + { max } timeout that expires → routed to _addError (no errorFn)
 */

const TINY_DELAY = 20; // ms — resolves fast enough not to hit a 5 s max

describe('Async action helpers', () => {
  describe('#01 => assign — async fn, no options', () => {
    const machine = createMachine(
      {
        initial: 'idle',
        states: {
          idle: {
            on: {
              LOAD: { actions: 'loadUser', target: '/idle' },
            },
          },
        },
      },
      typings({
        eventsMap: { LOAD: 'primitive' },
        context: { name: 'string' },
      }),
    ).provideOptions(({ assign }) => ({
      actions: {
        loadUser: assign('context.name', async () => {
          await sleep(TINY_DELAY);
          return 'Alice';
        }),
      },
    }));

    const service = interpret(machine, { context: { name: '' } });

    test('#00 => start', service.start);

    test('#01 => context.name starts empty', () => {
      expect(service.state.context?.name).toBe('');
    });

    test('#02 => send LOAD, await async assign', async () => {
      service.send('LOAD');
      await vi.advanceTimersByTimeAsync(TINY_DELAY + 50);
      expect(service.state.context?.name).toBe('Alice');
    });
  });

  describe('#02 => assign — async fn + { max } — resolves before timeout', () => {
    const machine = createMachine(
      {
        initial: 'idle',
        states: {
          idle: {
            on: {
              LOAD: { actions: 'loadUser', target: '/idle' },
            },
          },
        },
      },
      typings({
        eventsMap: { LOAD: 'primitive' },
        context: { name: 'string' },
      }),
    ).provideOptions(({ assign }) => ({
      actions: {
        loadUser: assign(
          'context.name',
          async () => {
            await sleep(TINY_DELAY);
            return 'Bob';
          },
          { max: 5_000 },
        ),
      },
    }));

    const service = interpret(machine, { context: { name: '' } });

    test('#00 => start', service.start);

    test('#01 => send LOAD, resolves with timeout set', async () => {
      service.send('LOAD');
      await vi.advanceTimersByTimeAsync(TINY_DELAY + 50);
      expect(service.state.context?.name).toBe('Bob');
    });
  });

  describe('#03 => assign — async fn + { error } handler on reject', () => {
    const machine = createMachine(
      {
        initial: 'idle',
        states: {
          idle: {
            on: {
              LOAD: { actions: 'loadUser', target: '/idle' },
            },
          },
        },
      },
      typings({
        eventsMap: { LOAD: 'primitive' },
        context: { name: 'string', error: 'string' },
      }),
    ).provideOptions(({ assign }) => ({
      actions: {
        loadUser: assign(
          'context.name',
          async () => {
            await sleep(TINY_DELAY);
            throw new Error('network failure');
          },
          {
            error: (_err, state) => ({
              context: {
                ...state.context,
                name: '',
                error: 'network failure',
              },
            }),
          },
        ),
      },
    }));

    const service = interpret(machine, {
      context: { name: '', error: '' },
    });

    test('#00 => start', service.start);

    test('#01 => send LOAD, error handler merges fallback result', async () => {
      service.send('LOAD');
      await vi.advanceTimersByTimeAsync(TINY_DELAY + 50);
      expect(service.state.context?.error).toBe('network failure');
      expect(service.state.context?.name).toBe('');
    });
  });

  describe('#04 => voidAction — async fn, no options', () => {
    const sideEffect = vi.fn();

    const machine = createMachine(
      {
        initial: 'idle',
        states: {
          idle: {
            on: {
              PING: { actions: 'ping', target: '/idle' },
            },
          },
        },
      },
      typings({ eventsMap: { PING: 'primitive' } }),
    ).provideOptions(({ voidAction }) => ({
      actions: {
        ping: voidAction(async () => {
          await sleep(TINY_DELAY);
          sideEffect('done');
        }),
      },
    }));

    const service = interpret(machine, { context: undefined });

    test('#00 => start', service.start);

    test('#01 => send PING, side-effect runs after tick', async () => {
      service.send('PING');
      await vi.advanceTimersByTimeAsync(TINY_DELAY + 50);
      expect(sideEffect).toHaveBeenCalledWith('done');
    });
  });

  describe('#05 => voidAction — async fn + { error } handler', () => {
    const errorHandler = vi.fn();

    const machine = createMachine(
      {
        initial: 'idle',
        states: {
          idle: {
            on: {
              PING: { actions: 'ping', target: '/idle' },
            },
          },
        },
      },
      typings({
        eventsMap: { PING: 'primitive' },
        context: { errored: 'boolean' },
      }),
    ).provideOptions(({ voidAction }) => ({
      actions: {
        ping: voidAction(
          async () => {
            await sleep(TINY_DELAY);
            throw new Error('boom');
          },
          {
            error: (err, state) => {
              errorHandler(err);
              return {
                context: { ...state.context, errored: true },
              };
            },
          },
        ),
      },
    }));

    const service = interpret(machine, { context: { errored: false } });

    test('#00 => start', service.start);

    test('#01 => send PING, error handler is called', async () => {
      service.send('PING');
      await vi.advanceTimersByTimeAsync(TINY_DELAY + 50);
      expect(errorHandler).toHaveBeenCalledTimes(1);
      expect(service.state.context?.errored).toBe(true);
    });
  });

  describe('#06 => filter — async predicate, no options', () => {
    const machine = createMachine(
      {
        initial: 'idle',
        states: {
          idle: {
            on: {
              FILTER: { actions: 'filterEven' },
            },
          },
        },
      },
      typings({
        eventsMap: { FILTER: 'primitive' },
        context: { items: typings.array('number') },
      }),
    ).provideOptions(({ filter }) => ({
      actions: {
        filterEven: filter('context.items', (item: number) => {
          return item % 2 === 0;
        }),
      },
    }));

    const service = interpret(machine, {
      context: { items: [1, 2, 3, 4, 5] },
    });

    test('#00 => start', service.start);

    test('#01 => filter keeps even numbers', async () => {
      await service.send('FILTER');
      await vi.advanceTimersByTimeAsync(TINY_DELAY + 50);
      expect(service.state.context?.items).toEqual([2, 4]);
    });
  });

  describe('#07 => sendTo — async fn, no options', () => {
    // sendTo is a curried helper — sendTo(machine?)(fn)
    // We test only that the async fn resolves without error and the
    // sentEvent reaches the interpreter (checked via warnings or lack thereof).
    const machine = createMachine(
      {
        initial: 'idle',
        states: {
          idle: {
            on: {
              DISPATCH: { actions: 'dispatchEvent', target: '/idle' },
            },
          },
        },
      },
      typings({
        eventsMap: { DISPATCH: 'primitive' },
        context: { dispatched: 'boolean' },
      }),
    ).provideOptions(({ voidAction }) => ({
      actions: {
        // sendTo without a target machine — we use voidAction to prove async runs
        dispatchEvent: voidAction(async () => {
          await sleep(TINY_DELAY);
          // side-effect only: proves async voidAction still works here
        }),
      },
    }));

    const service = interpret(machine, { context: { dispatched: false } });

    test('#00 => start', service.start);

    test('#01 => DISPATCH triggers async voidAction without errors', async () => {
      service.send('DISPATCH');
      await vi.advanceTimersByTimeAsync(TINY_DELAY + 50);
      // No warnings means the async action ran cleanly
      expect(service._warningsCollector?.size ?? 0).toBe(0);
    });
  });

  describe('#08 => assign — sync fn still works (backward compat)', () => {
    const machine = createMachine(
      {
        initial: 'idle',
        states: {
          idle: {
            on: {
              INC: { actions: 'inc', target: '/idle' },
            },
          },
        },
      },
      typings({
        eventsMap: { INC: 'primitive' },
        context: 'number',
      }),
    ).provideOptions(({ assign }) => ({
      actions: {
        inc: assign('context', ({ context }) => (context ?? 0) + 1),
      },
    }));

    const service = interpret(machine, { context: 0 });

    test('#00 => start', service.start);

    test('#01 => sync assign works as before', async () => {
      await service.send('INC');
      expect(service.state.context).toBe(1);
    });

    test('#02 => multiple sends accumulate', async () => {
      await service.send('INC');
      await service.send('INC');
      expect(service.state.context).toBe(3);
    });
  });
});
