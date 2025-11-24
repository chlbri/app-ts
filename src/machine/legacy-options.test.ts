import { interpret } from '#interpreter';
import { createMachine } from '#machine';
import { typings } from '#utils';

describe('Legacy Options Access', () => {
  test('should access previous actions via _legacy', () => {
    const machine = createMachine(
      {
        initial: 'idle',
        states: {
          idle: {
            on: {
              NEXT: {
                actions: 'increment',
              },
              DOUBLE: {
                actions: 'doubleIncrement',
              },
            },
          },
        },
      },
      typings({
        eventsMap: {
          NEXT: 'primitive',
          DOUBLE: 'primitive',
        },
        context: 'number',
      }),
    );

    // First call to addOptions - define increment
    machine.addOptions(({ assign }) => ({
      actions: {
        increment: assign('context', ({ context }) => context + 1),
      },
    }));

    // Second call to addOptions - access previous action via _legacy
    machine.addOptions(({ _legacy, batch }) => {
      const previousIncrement = _legacy.actions?.increment;
      expect(previousIncrement).toBeDefined();

      return {
        actions: {
          doubleIncrement: batch(
            previousIncrement!,
            previousIncrement!,
          ),
        },
      };
    });

    const service = interpret(machine, { context: 0 });

    service.start();
    expect(service.state.context).toBe(0);

    service.send('NEXT');
    expect(service.state.context).toBe(1);

    service.send('DOUBLE');
    expect(service.state.context).toBe(3);
  });

  test('should access previous predicates via _legacy', () => {
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
                {
                  guards: 'isNegative',
                  target: '/negative',
                },
              ],
            },
          },
          positive: {},
          negative: {},
        },
      },
      typings({
        eventsMap: {
          CHECK: 'primitive',
        },
        context: 'number',
      }),
    );

    // First call - define isPositive
    machine.addOptions(({ isDefined }) => ({
      predicates: {
        isPositive: ({ context }) => context > 0,
      },
    }));

    // Second call - access and extend with isNegative using _legacy
    machine.addOptions(({ _legacy }) => {
      const previousPredicates = _legacy.predicates;
      expect(previousPredicates?.isPositive).toBeDefined();

      return {
        predicates: {
          isNegative: ({ context }) => context < 0,
        },
      };
    });

    const service = interpret(machine, { context: 5 });

    service.start();
    expect(service.state.value).toBe('idle');

    service.send('CHECK');
    expect(service.state.value).toBe('positive');
  });

  test('should work with provideOptions', () => {
    const machine = createMachine(
      {
        initial: 'idle',
        states: {
          idle: {
            on: {
              ADD: {
                actions: 'add',
              },
              MULTIPLY: {
                actions: 'multiply',
              },
            },
          },
        },
      },
      typings({
        eventsMap: {
          ADD: 'primitive',
          MULTIPLY: 'primitive',
        },
        context: 'number',
      }),
    ).provideOptions(({ assign }) => ({
      actions: {
        add: assign('context', ({ context }) => context + 2),
      },
    }));

    // provideOptions on the result should also have access to _legacy
    const machine2 = machine.provideOptions(({ _legacy, assign }) => {
      const previousAdd = _legacy.actions?.add;
      expect(previousAdd).toBeDefined();

      return {
        actions: {
          multiply: assign('context', ({ context }) => context * 2),
        },
      };
    });

    const service = interpret(machine2, { context: 1 });

    service.start();
    expect(service.state.context).toBe(1);

    service.send('ADD');
    expect(service.state.context).toBe(3);

    service.send('MULTIPLY');
    expect(service.state.context).toBe(6);
  });

  test('_legacy should be immutable', () => {
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

    machine.addOptions(({ assign }) => ({
      actions: {
        test: assign('context', ({ context }) => context + 1),
      },
    }));

    machine.addOptions(({ _legacy }) => {
      // Attempt to modify _legacy should not affect the original
      expect(() => {
        (_legacy as any).actions = {};
      }).toThrow();

      return undefined;
    });
  });

  test('should handle multiple calls with cumulative legacy', () => {
    const machine = createMachine(
      {
        initial: 'idle',
        states: {
          idle: {
            on: {
              FIRST: { actions: 'first' },
              SECOND: { actions: 'second' },
              THIRD: { actions: 'third' },
            },
          },
        },
      },
      typings({
        eventsMap: {
          FIRST: 'primitive',
          SECOND: 'primitive',
          THIRD: 'primitive',
        },
        context: 'number',
      }),
    );

    // First call
    machine.addOptions(({ assign }) => ({
      actions: {
        first: assign('context', ({ context }) => context + 1),
      },
    }));

    // Second call - should see first
    machine.addOptions(({ _legacy, assign }) => {
      expect(_legacy.actions?.first).toBeDefined();
      expect(_legacy.actions?.second).toBeUndefined();

      return {
        actions: {
          second: assign('context', ({ context }) => context + 10),
        },
      };
    });

    // Third call - should see first and second
    machine.addOptions(({ _legacy, assign }) => {
      expect(_legacy.actions?.first).toBeDefined();
      expect(_legacy.actions?.second).toBeDefined();
      expect(_legacy.actions?.third).toBeUndefined();

      return {
        actions: {
          third: assign('context', ({ context }) => context + 100),
        },
      };
    });

    const service = interpret(machine, { context: 0 });
    service.start();

    service.send('FIRST');
    expect(service.state.context).toBe(1);

    service.send('SECOND');
    expect(service.state.context).toBe(11);

    service.send('THIRD');
    expect(service.state.context).toBe(111);
  });
});
