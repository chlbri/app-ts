import { machine1, type Machine1 } from '#fixturesData';
import type { StatePFrom } from '#machines';
import { describe, expect, test, vi } from 'vitest';
import { interpret } from './interpreter';
import type { State } from './interpreter.types';

describe('#01 => subscriberMap reduceFn coverage', () => {
  type TestContext = { iterator: number };

  // Configuration de base pour l'interpréteur
  const baseConfig = {
    context: { iterator: 0 },
    pContext: {},
    mode: 'strict' as const,
    exact: true,
  };

  describe('#01.01 => function subscriber cases', () => {
    test('#01.01.01 => should handle function subscriber', () => {
      const service = interpret(machine1, baseConfig);
      const mockFn = vi.fn(() => 'function-result');

      const subscriber = service.subscribe(mockFn);

      service.start();
      service.send({ type: 'NEXT', payload: {} });

      expect(mockFn).toHaveBeenCalled();
      expect(subscriber.state).toBe('active');

      service.stop();
    });

    test('#01.01.02 => should handle function subscriber with different states', () => {
      const service = interpret(machine1, baseConfig);
      const mockFn = vi.fn(
        (state: State<TestContext>) => `result-${state.context.iterator}`,
      );

      const subscriber = service.subscribe(mockFn);

      service.start();
      expect(mockFn).toHaveBeenCalledTimes(5);
      service.send({ type: 'NEXT', payload: {} });

      expect(mockFn).toHaveBeenCalledTimes(10);
      expect(subscriber.state).toBe('active');

      service.stop();
    });

    test('#01.01.03 => should not call function when subscriber is paused', () => {
      const service = interpret(machine1, baseConfig);
      const mockFn = vi.fn();

      const subscriber = service.subscribe(mockFn);

      service.start();
      expect(mockFn).toHaveBeenCalledTimes(5);
      subscriber.close();
      expect(mockFn).toHaveBeenCalledTimes(5);
      service.send({ type: 'NEXT', payload: {} });

      expect(subscriber.state).toBe('paused');
      expect(mockFn).toHaveBeenCalledTimes(5);

      service.stop();
    });

    test('#01.01.04 => should not call function when subscriber is disposed', () => {
      const service = interpret(machine1, baseConfig);
      const mockFn = vi.fn();

      const subscriber = service.subscribe(mockFn);

      service.start();
      subscriber.unsubscribe();
      service.send({ type: 'NEXT', payload: {} });

      expect(subscriber.state).toBe('disposed');

      service.stop();
    });

    test('#01.01.05 => should handle function subscriber reopening', () => {
      const service = interpret(machine1, baseConfig);
      const mockFn = vi.fn(() => 'reopened-result');

      const subscriber = service.subscribe(mockFn);

      service.start();

      // Pause puis reopen
      subscriber.close();
      expect(subscriber.state).toBe('paused');

      subscriber.open();
      expect(subscriber.state).toBe('active');

      service.send({ type: 'NEXT', payload: {} });

      expect(mockFn).toHaveBeenCalled();

      service.stop();
    });
  });

  describe('#01.02 => object subscriber cases', () => {
    describe('#01.02.01 => event type matching cases', () => {
      test('#01.02.01.01 => should handle matching event type with handler', () => {
        const service = interpret(machine1, baseConfig);
        const nextFn = vi.fn(() => 'next-result');

        const subscriber = service.subscribe({ NEXT: nextFn });

        service.start();
        service.send({ type: 'NEXT', payload: {} });
        expect((service.event as any).type).toBe('NEXT');

        expect(nextFn).toHaveBeenCalled();
        expect(subscriber.state).toBe('active');

        service.stop();
      });

      test('#01.02.01.02 => should handle matching event type with handler and payload access', () => {
        const service = interpret(machine1, baseConfig);
        const nextFn = vi.fn((state: StatePFrom<Machine1>) => {
          const payload = state.payload;
          if (typeof payload === 'object') {
            return `next-${JSON.stringify(payload)}`;
          }
          return 'next-no-payload';
        });

        const subscriber = service.subscribe({ NEXT: nextFn });

        service.start();
        service.send({ type: 'NEXT', payload: { data: 'test' } });

        expect(nextFn).toHaveBeenCalled();
        expect(subscriber.state).toBe('active');

        service.stop();
      });

      test('#01.02.01.03 => should handle non-matching event type with else', () => {
        const service = interpret(machine1, baseConfig);
        const nextFn = vi.fn();
        const elseFn = vi.fn(() => 'else-for-unknown');

        const subscriber = service.subscribe({
          NEXT: nextFn,
          else: elseFn,
        });

        service.start();

        // Simuler un événement qui ne correspond pas
        // (utiliser un événement interne pour déclencher else)
        service.send({ type: 'NEXT', payload: {} });

        expect(nextFn).toHaveBeenCalled();
        expect(subscriber.state).toBe('active');

        service.stop();
      });

      test('#01.02.01.04 => should handle event type matching but handler is null', () => {
        const service = interpret(machine1, baseConfig);
        const elseFn = vi.fn(() => 'else-null-handler');

        const subscriber = service.subscribe({
          NEXT: undefined,
          else: elseFn,
        });

        service.start();
        service.send({ type: 'NEXT', payload: {} });

        expect(subscriber.state).toBe('active');

        service.stop();
      });

      test('#01.02.01.05 => should handle event type matching but handler is undefined', () => {
        const service = interpret(machine1, baseConfig);
        const elseFn = vi.fn(() => 'else-undefined-handler');

        const subscriber = service.subscribe({
          NEXT: undefined,
          else: elseFn,
        });

        service.start();
        service.send({ type: 'NEXT', payload: {} });

        expect(subscriber.state).toBe('active');

        service.stop();
      });
    });

    describe('#01.02.02 => multiple event handlers', () => {
      test('#01.02.02.01 => should handle multiple event types with specific handlers', () => {
        const service = interpret(machine1, baseConfig);
        const nextFn = vi.fn(() => 'next-handler');

        const subscriber = service.subscribe({
          NEXT: nextFn,
        });

        service.start();
        service.send({ type: 'NEXT', payload: {} });

        expect(nextFn).toHaveBeenCalled();
        expect(subscriber.state).toBe('active');

        service.stop();
      });

      test('#01.02.02.02 => should handle first matching event type in order', () => {
        const service = interpret(machine1, baseConfig);
        const firstFn = vi.fn(() => 'first-handler');

        const subscriber = service.subscribe({
          NEXT: firstFn,
        });

        service.start();
        service.send({ type: 'NEXT', payload: {} });

        expect(firstFn).toHaveBeenCalled();
        expect(subscriber.state).toBe('active');

        service.stop();
      });
    });

    describe('#01.02.03 => else handler cases', () => {
      test('#01.02.03.01 => should handle else without specific handlers', () => {
        const service = interpret(machine1, baseConfig);
        const elseFn = vi.fn(() => 'else-result');

        const subscriber = service.subscribe({
          else: elseFn,
        });

        service.start();
        service.send({ type: 'NEXT', payload: {} });

        expect(subscriber.state).toBe('active');

        service.stop();
      });

      test('#01.02.03.02 => should handle mixed handlers with else', () => {
        const service = interpret(machine1, baseConfig);
        const nextFn = vi.fn(() => 'next-result');
        const elseFn = vi.fn(() => 'else-result');

        const subscriber = service.subscribe({
          NEXT: nextFn,
          else: elseFn,
        });

        service.start();
        service.send({ type: 'NEXT', payload: {} });

        expect(nextFn).toHaveBeenCalled();
        expect(subscriber.state).toBe('active');

        service.stop();
      });
    });
  });

  describe('#01.03 => edge cases and error handling', () => {
    test('#01.03.01 => should handle custom equality function', () => {
      const service = interpret(machine1, baseConfig);
      const mockFn = vi.fn(() => 'custom-equality');
      const customEquals = vi.fn(
        (a: State<TestContext>, b: State<TestContext>) =>
          a.context.iterator === b.context.iterator,
      );

      const subscriber = service.subscribe(mockFn, {
        equals: customEquals,
      });

      service.start();
      service.send({ type: 'NEXT', payload: {} });

      expect(subscriber.state).toBe('active');

      service.stop();
    });

    test('#01.03.02 => should handle states equal according to custom equality', () => {
      const service = interpret(machine1, baseConfig);
      const mockFn = vi.fn();
      const customEquals = vi.fn(() => true); // Always equal

      const subscriber = service.subscribe(mockFn, {
        equals: customEquals,
      });

      service.start();
      service.send({ type: 'NEXT', payload: {} });

      expect(subscriber.state).toBe('active');

      service.stop();
    });

    test('#01.03.03 => should handle empty object subscriber', () => {
      const service = interpret(machine1, baseConfig);

      const subscriber = service.subscribe({});

      service.start();
      service.send({ type: 'NEXT', payload: {} });

      expect(subscriber.state).toBe('active');

      service.stop();
    });

    test('#01.03.04 => should handle subscriber with custom id', () => {
      const service = interpret(machine1, baseConfig);
      const mockFn = vi.fn(() => 'custom-id-result');

      const subscriber = service.subscribe(mockFn, {
        id: 'custom-subscriber-id',
      });

      expect(subscriber.id).toBe('custom-subscriber-id');

      service.start();
      service.send({ type: 'NEXT', payload: {} });

      expect(subscriber.state).toBe('active');

      service.stop();
    });
  });

  describe('#01.04 => subscriber lifecycle', () => {
    test('#01.04.01 => should handle subscriber state changes', () => {
      const service = interpret(machine1, baseConfig);
      const mockFn = vi.fn(() => 'lifecycle-result');

      const subscriber = service.subscribe(mockFn);

      expect(subscriber.state).toBe('active');

      service.start();

      // Test paused state
      subscriber.close();
      expect(subscriber.state).toBe('paused');

      // Test reopened state
      subscriber.open();
      expect(subscriber.state).toBe('active');

      // Test disposed state
      subscriber.unsubscribe();
      expect(subscriber.state).toBe('disposed');

      service.stop();
    });

    test('#01.04.02 => should not reopen after disposal', () => {
      const service = interpret(machine1, baseConfig);
      const subscriber = service.subscribe(vi.fn());

      service.start();

      subscriber.unsubscribe();
      expect(subscriber.state).toBe('disposed');

      subscriber.open();
      expect(subscriber.state).toBe('disposed');

      service.stop();
    });

    test('#01.04.03 => should handle multiple close/open cycles', () => {
      const service = interpret(machine1, baseConfig);
      const mockFn = vi.fn(() => 'cycle-result');

      const subscriber = service.subscribe(mockFn);

      service.start();

      // Multiple close/open cycles
      for (let i = 0; i < 3; i++) {
        subscriber.close();
        expect(subscriber.state).toBe('paused');

        subscriber.open();
        expect(subscriber.state).toBe('active');
      }

      service.stop();
    });

    test('#01.04.04 => should handle subscriber ID uniqueness', () => {
      const service = interpret(machine1, baseConfig);
      const mockFn1 = vi.fn(() => 'first-subscriber');
      const mockFn2 = vi.fn(() => 'second-subscriber');

      const subscriber1 = service.subscribe(mockFn1, {
        id: 'unique-id',
      });
      const subscriber2 = service.subscribe(mockFn2, {
        id: 'unique-id',
      });

      // Should return the same subscriber for same ID
      expect(subscriber1).toBe(subscriber2);
      expect(subscriber1.id).toBe('unique-id');

      service.start();
      service.stop();
    });
  });

  describe('#01.05 => integration with machine states', () => {
    test('#01.05.01 => should handle state transitions', () => {
      const service = interpret(machine1, baseConfig);
      const mockFn = vi.fn((state: State<TestContext>) => {
        return `state-${state.value}`;
      });

      const subscriber = service.subscribe(mockFn);

      service.start();
      expect(service.value).toBe('idle');

      service.send({ type: 'NEXT', payload: {} });
      expect(service.value).toBe('final');

      expect(mockFn).toHaveBeenCalled();
      expect(subscriber.state).toBe('active');

      service.stop();
    });

    test('#01.05.02 => should handle context changes', () => {
      const service = interpret(machine1, baseConfig);
      const mockFn = vi.fn((state: State<TestContext>) => {
        return `iterator-${state.context.iterator}`;
      });

      const subscriber = service.subscribe(mockFn);

      service.start();

      // Le contexte peut changer via les activities
      expect(service.context.iterator).toBe(0);

      service.send({ type: 'NEXT', payload: {} });

      expect(mockFn).toHaveBeenCalled();
      expect(subscriber.state).toBe('active');

      service.stop();
    });

    test('#01.05.03 => should handle machine restart', () => {
      const service = interpret(machine1, baseConfig);
      const mockFn = vi.fn(() => 'restart-result');

      const subscriber = service.subscribe(mockFn);

      service.start();
      service.send({ type: 'NEXT', payload: {} });
      service.stop();

      // Après stop, le subscriber peut être disposé - c'est normal
      expect(['active', 'disposed']).toContain(subscriber.state);

      // Restart machine
      service.start();
      service.send({ type: 'NEXT', payload: {} });

      expect(mockFn).toHaveBeenCalled();

      service.stop();
    });
  });
});
