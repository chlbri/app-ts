import { interpret } from '#interpreter';
import { createMachine } from '#machine';
import { typings } from '#utils';

describe('addOptions Return Type', () => {
  describe('#01 => Machine addOptions return', () => {
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

      const result = machine.addOptions(() => undefined);

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
        },
        predicates: {
          isPositive: ({ context }) => context > 0,
        },
        delays: {
          shortDelay: () => 100,
        },
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

  describe('#02 => Interpreter addOptions return', () => {
    test('#01 => should return the options object from service.addOptions', () => {
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

      const service = interpret(machine, { context: 0 });

      const result = service.addOptions(() => undefined);

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

      const service = interpret(machine, { context: 0 });

      const result = service.addOptions(({ assign }) => ({
        actions: {
          setZero: assign('context', () => 0),
        },
        predicates: {
          isPositive: ({ context }) => context > 0,
        },
        delays: {
          shortDelay: () => 100,
        },
      }));

      expect(result).toBeDefined();
      expect(result?.actions).toBeDefined();
      expect(result?.predicates).toBeDefined();
      expect(result?.delays).toBeDefined();
    });

    test('#04 => should still add options to service even when capturing return value', () => {
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

      service.send('INCREMENT');
      expect(service.state.context).toBe(1);
    });

    test('#05 => should return consistent type across multiple addOptions calls', () => {
      const machine = createMachine(
        {
          initial: 'idle',
          states: {
            idle: {
              on: {
                FIRST: { actions: 'first' },
                SECOND: { actions: 'second' },
              },
            },
          },
        },
        typings({
          eventsMap: {
            FIRST: 'primitive',
            SECOND: 'primitive',
          },
          context: 'number',
        }),
      );

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
      service.send('FIRST');
      expect(service.state.context).toBe(1);

      service.send('SECOND');
      expect(service.state.context).toBe(11);
    });
  });
});
