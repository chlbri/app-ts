import { interpret } from '#interpreter';
import { createMachine } from '#machine';
import { typings } from '#utils';

describe('Legacy Options Access', () => {
  test('#01 => should access previous actions via _legacy', () => {
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
    machine.addOptions(({ batch }, { _legacy }) => {
      const prev = _legacy.actions?.increment;
      expect(prev).toBeDefined();

      return {
        actions: {
          doubleIncrement: batch(prev, prev),
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

  test('#02 => should access previous actions via _legacy, replace the same action', () => {
    const machine = createMachine(
      {
        initial: 'idle',
        states: {
          idle: {
            on: {
              NEXT: {
                actions: 'increment',
              },
            },
          },
        },
      },
      typings({
        eventsMap: {
          NEXT: 'primitive',
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
    machine.addOptions(({ batch }, { _legacy }) => {
      const prev = _legacy.actions?.increment;
      expect(prev).toBeDefined();

      return {
        actions: {
          increment: batch(prev, prev),
        },
      };
    });

    const service = interpret(machine, { context: 0 });

    service.start();
    expect(service.state.context).toBe(0);

    service.send('NEXT');
    expect(service.state.context).toBe(2);

    service.send('NEXT');
    expect(service.state.context).toBe(4);
  });

  test('#03 =>should access previous predicates via _legacy', () => {
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
    machine.addOptions(() => ({
      predicates: {
        isPositive: ({ context }) => context > 0,
      },
    }));

    // Second call - access and extend with isNegative using _legacy
    machine.addOptions((_, { _legacy }) => {
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

  test('#04 => should work with provideOptions', () => {
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
    const machine2 = machine.provideOptions(({ assign }, { _legacy }) => {
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

  test('#05 => _legacy should be immutable', () => {
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

    machine.addOptions((_, { _legacy }) => {
      // Attempt to modify _legacy should not affect the original
      expect(() => {
        (_legacy as any).actions = {};
      }).toThrow();

      return undefined;
    });
  });

  test('#06 => should handle multiple calls with cumulative legacy', () => {
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
    machine.addOptions(({ assign }, { _legacy }) => {
      expect(_legacy.actions?.first).toBeDefined();
      expect(_legacy.actions?.second).toBeUndefined();

      return {
        actions: {
          second: assign('context', ({ context }) => context + 10),
        },
      };
    });

    // Third call - should see first and second
    machine.addOptions(({ assign }, { _legacy }) => {
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

  describe('#07 => Service (Interpreter) addOptions', () => {
    test('#01 => should access previous actions via _legacy on service.addOptions', () => {
      const machine = createMachine(
        {
          initial: 'idle',
          states: {
            idle: {
              on: {
                NEXT: {
                  actions: 'increment',
                },
                TRIPLE: {
                  actions: 'tripleIncrement',
                },
              },
            },
          },
        },
        typings({
          eventsMap: {
            NEXT: 'primitive',
            TRIPLE: 'primitive',
          },
          context: 'number',
        }),
      );

      const service = interpret(machine, { context: 0 });

      // First call to service.addOptions - define increment
      service.addOptions(({ assign }) => ({
        actions: {
          increment: assign('context', ({ context }) => context + 1),
        },
      }));

      // Second call to service.addOptions - access previous action via _legacy
      service.addOptions(({ batch }, { _legacy }) => {
        const prev = _legacy.actions?.increment;
        expect(prev).toBeDefined();
        const params = Array(3).fill(prev);

        return {
          actions: {
            tripleIncrement: batch(...params),
          },
        };
      });

      service.start();
      expect(service.state.context).toBe(0);

      service.send('NEXT');
      expect(service.state.context).toBe(1);

      service.send('TRIPLE');
      expect(service.state.context).toBe(4);
    });

    test('#02 => should access previous actions via _legacy on service.addOptions, changes the same action', () => {
      const machine = createMachine(
        {
          initial: 'idle',
          states: {
            idle: {
              on: {
                NEXT: {
                  actions: 'increment',
                },
              },
            },
          },
        },
        typings({
          eventsMap: {
            NEXT: 'primitive',
          },
          context: 'number',
        }),
      );

      const service = interpret(machine, { context: 0 });

      // First call to service.addOptions - define increment
      service.addOptions(({ assign }) => ({
        actions: {
          increment: assign('context', ({ context }) => context + 1),
        },
      }));

      service.start();
      expect(service.state.context).toBe(0);

      service.send('NEXT');
      expect(service.state.context).toBe(1);

      // Second call to service.addOptions - access previous action via _legacy
      service.addOptions(({ batch }, { _legacy }) => {
        const prev = _legacy.actions?.increment;
        expect(prev).toBeDefined();
        const params = Array(2).fill(prev);

        return {
          actions: {
            increment: batch(...params),
          },
        };
      });

      service.send('NEXT');
      expect(service.state.context).toBe(3);

      // Third call to service.addOptions - access previous action via _legacy
      service.addOptions(({ batch }, { _legacy }) => {
        const prev = _legacy.actions?.increment;
        expect(prev).toBeDefined();

        return {
          actions: {
            increment: batch(prev, prev, prev),
          },
        };
      });

      service.send('NEXT');
      expect(service.state.context).toBe(9);
    });

    test('#03 => should access previous predicates via _legacy on service.addOptions', () => {
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

      const service = interpret(machine, { context: 5 });

      // First call - define isPositive
      service.addOptions(() => ({
        predicates: {
          isPositive: ({ context }) => context > 0,
        },
      }));

      // Second call - access and extend with isNegative using _legacy
      service.addOptions((_, { _legacy }) => {
        const previousPredicates = _legacy.predicates;
        expect(previousPredicates?.isPositive).toBeDefined();

        return {
          predicates: {
            isNegative: ({ context }) => context < 0,
          },
        };
      });

      service.start();
      expect(service.state.value).toBe('idle');

      service.send('CHECK');
      expect(service.state.value).toBe('positive');
    });

    test('#04 => should handle cumulative legacy on service.addOptions', () => {
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
      service.addOptions(({ assign }) => ({
        actions: {
          first: assign('context', ({ context }) => context + 5),
        },
      }));

      // Second call - should see first
      service.addOptions(({ assign }, { _legacy }) => {
        expect(_legacy.actions?.first).toBeDefined();
        expect(_legacy.actions?.second).toBeUndefined();

        return {
          actions: {
            second: assign('context', ({ context }) => context + 20),
          },
        };
      });

      service.start();

      service.send('FIRST');
      expect(service.state.context).toBe(5);

      service.send('SECOND');
      expect(service.state.context).toBe(25);
    });
  });

  describe('#08 => Service (Interpreter) provideOptions', () => {
    test('#01 => should access previous actions via _legacy on service.provideOptions', () => {
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
      );

      const service1 = interpret(machine, { context: 1 });

      // First provideOptions - define add
      const service2 = service1.provideOptions(({ assign }) => ({
        actions: {
          add: assign('context', ({ context }) => context + 3),
        },
      }));

      // Second provideOptions - access previous action via _legacy
      const service3 = service2.provideOptions(
        ({ assign }, { _legacy }) => {
          const previousAdd = _legacy.actions?.add;
          expect(previousAdd).toBeDefined();

          return {
            actions: {
              multiply: assign('context', ({ context }) => context * 2),
            },
          };
        },
      );

      service3.start();
      expect(service3.state.context).toBe(1);

      service3.send('ADD');
      expect(service3.state.context).toBe(4);

      service3.send('MULTIPLY');
      expect(service3.state.context).toBe(8);
    });

    test('#02 => should return new service instance with provideOptions', () => {
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

      const service1 = interpret(machine, { context: 0 });
      const service2 = service1.provideOptions(({ assign }) => ({
        actions: {
          increment: assign('context', ({ context }) => context + 1),
        },
      }));

      // Verify they are different instances
      expect(service1).not.toBe(service2);

      // service1 should not have the increment action defined
      service1.start();
      service1.send('INCREMENT');
      expect(service1.state.context).toBe(0); // No change

      // service2 should have the increment action
      service2.start();
      service2.send('INCREMENT');
      expect(service2.state.context).toBe(1);
    });

    test('#03 => should chain provideOptions with cumulative legacy', () => {
      const machine = createMachine(
        {
          initial: 'idle',
          states: {
            idle: {
              on: {
                OP1: { actions: 'op1' },
                OP2: { actions: 'op2' },
                OP3: { actions: 'op3' },
              },
            },
          },
        },
        typings({
          eventsMap: {
            OP1: 'primitive',
            OP2: 'primitive',
            OP3: 'primitive',
          },
          context: 'number',
        }),
      );

      const service1 = interpret(machine, { context: 0 });

      const service2 = service1.provideOptions(({ assign }) => ({
        actions: {
          op1: assign('context', ({ context }) => context + 1),
        },
      }));

      const service3 = service2.provideOptions(
        ({ assign }, { _legacy }) => {
          expect(_legacy.actions?.op1).toBeDefined();
          expect(_legacy.actions?.op2).toBeUndefined();

          return {
            actions: {
              op2: assign('context', ({ context }) => context + 10),
            },
          };
        },
      );

      const service4 = service3.provideOptions(
        ({ assign }, { _legacy }) => {
          expect(_legacy.actions?.op1).toBeDefined();
          expect(_legacy.actions?.op2).toBeDefined();
          expect(_legacy.actions?.op3).toBeUndefined();

          return {
            actions: {
              op3: assign('context', ({ context }) => context + 100),
            },
          };
        },
      );

      service4.start();

      service4.send('OP1');
      expect(service4.state.context).toBe(1);

      service4.send('OP2');
      expect(service4.state.context).toBe(11);

      service4.send('OP3');
      expect(service4.state.context).toBe(111);
    });

    test('#04 => should preserve context and pContext across provideOptions', () => {
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

      const service1 = interpret(machine, { context: 10 });

      const service2 = service1.provideOptions(({ assign }) => ({
        actions: {
          increment: assign('context', ({ context }) => context + 5),
        },
      }));

      // Verify initial context is preserved
      service2.start();
      expect(service2.state.context).toBe(10);

      service2.send('INCREMENT');
      expect(service2.state.context).toBe(15);
    });
  });
});
