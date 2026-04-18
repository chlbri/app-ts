import { interpret } from '#interpreter';
import _machine1 from './addOptions-return.1.machine';
import _machine2 from './addOptions-return.2.machine';
import _machine3 from './addOptions-return.3.machine';
import _machine4 from './addOptions-return.4.machine';
import _machine5 from './addOptions-return.5.machine';

describe.concurrent('Interpreter addOptions return', () => {
  test('#01 => should return the options object from service.addOptions', () => {
    const machine = _machine1;

    const service = interpret(machine, { context: 0 });

    const result = service.addOptions(({ assign }) => ({
      actions: {
        increment: assign('context', ({ context }) => context + 1),
      },
    }));

    expect(result).toBeDefined();
    expect(result?.actions).toBeDefined();
    expect(result?.actions?.increment).toBeDefined();
    expect(typeof result?.actions?.increment).toBe('function');
  });

  test('#02 => should return undefined when callback returns undefined', () => {
    const machine = _machine2;

    const service = interpret(machine, { context: 0 });

    const result = service.addOptions(() => undefined as any);

    expect(result).toBeUndefined();
  });

  test('#03 => should return options with multiple properties', () => {
    const machine = _machine3;

    const service = interpret(machine, { context: 0 });

    const result = service.addOptions(({ assign }) => ({
      actions: {
        setZero: assign('context', () => 0),
      } as any,
      predicates: {
        isPositive: ({ context }) => context > 0,
      },
      delays: {
        shortDelay: () => 100,
      } as any,
    }));

    expect(result).toBeDefined();
    expect(result?.actions).toBeDefined();
    expect(result?.predicates).toBeDefined();
    expect(result?.delays).toBeDefined();
  });

  test('#04 => should still add options to service even when capturing return value', async () => {
    const machine = _machine4;

    const service = interpret(machine, { context: 0 });

    const result = service.addOptions(({ assign }) => ({
      actions: {
        increment: assign('context', ({ context }) => context + 1),
      },
    }));

    expect(result).toBeDefined();

    // Verify the service actually has the options applied
    service.start();
    expect(service.state.context).toBe(0);

    await service.send('INCREMENT');
    expect(service.state.context).toBe(1);
  });

  test('#05 => should return consistent type across multiple addOptions calls', async () => {
    const machine = _machine5;

    const service = interpret(machine, { context: 0 });

    // First call
    const result1 = service.addOptions(({ assign }) => ({
      actions: {
        first: assign('context', ({ context }) => context + 1),
      },
    }));

    // Second call
    const result2 = service.addOptions(({ assign }) => ({
      actions: {
        second: assign('context', ({ context }) => context + 10),
      },
    }));

    expect(result1).toBeDefined();
    expect(result1?.actions?.first).toBeDefined();

    expect(result2).toBeDefined();
    expect(result2?.actions?.second).toBeDefined();

    // Verify both work
    service.start();
    await service.send('FIRST');
    expect(service.state.context).toBe(1);

    await service.send('SECOND');
    expect(service.state.context).toBe(11);
  });
});
