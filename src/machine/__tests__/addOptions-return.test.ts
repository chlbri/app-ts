import { interpret } from '#interpreter';
import { createMachine } from '#machine';
import { typings } from '#utils';

describe('Machine addOptions return', () => {
  test('#01 => should return the options object from machine.addOptions', () => {
    const machine = createMachine(
      {
        initial: 'idle',
        states: {
          idle: {
            on: {
              INCREMENT: {
                actions: 'increment',
              },
            },
          },
        },
      },
      typings({
        eventsMap: {
          INCREMENT: 'primitive',
        },
        context: 'number',
      }),
    );

    const result = machine.addOptions(({ assign }) => ({
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
    const machine = createMachine(
      {
        initial: 'idle',
        states: {
          idle: {},
        },
      },
      typings({
        eventsMap: {},
        context: 'number',
      }),
    );

    const result = machine.addOptions(() => undefined as any);

    expect(result).toBeUndefined();
  });

  test('#03 => should return options with multiple properties', () => {
    const machine = createMachine(
      {
        initial: 'idle',
        states: {
          idle: {
            on: {
              CHECK: [
                {
                  guards: 'isPositive',
                  target: '/positive',
                },
              ],
            },
          },
          positive: {},
        },
      },
      typings({
        eventsMap: {
          CHECK: 'primitive',
        },
        context: 'number',
      }),
    );

    const result = machine.addOptions(({ assign }) => ({
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

  test('#04 => should still add options to machine even when capturing return value', () => {
    const machine = createMachine(
      {
        initial: 'idle',
        states: {
          idle: {
            on: {
              INCREMENT: {
                actions: 'increment',
              },
            },
          },
        },
      },
      typings({
        eventsMap: {
          INCREMENT: 'primitive',
        },
        context: 'number',
      }),
    );

    const result = machine.addOptions(({ assign }) => ({
      actions: {
        increment: assign('context', ({ context }) => context + 1),
      },
    }));

    expect(result).toBeDefined();

    // Verify the machine actually has the options applied
    const service = interpret(machine, { context: 0 });
    service.start();
    expect(service.state.context).toBe(0);

    service.send('INCREMENT');
    expect(service.state.context).toBe(1);
  });
});
