import { interpret } from '#interpreter';
import _machine1 from './legacy-options.1.machine';
import _machine2 from './legacy-options.2.machine';
import _machine3 from './legacy-options.3.machine';
import _machine4 from './legacy-options.4.machine';
import _machine5 from './legacy-options.5.machine';
import _machine6 from './legacy-options.6.machine';
import _machine7 from './legacy-options.7.machine';
import _machine8 from './legacy-options.8.machine';
import _machine9 from './legacy-options.9.machine';
import _machine10 from './legacy-options.10.machine';
import _machine11 from './legacy-options.11.machine';
import _machine12 from './legacy-options.12.machine';
import _machine13 from './legacy-options.13.machine';
import _machine14 from './legacy-options.14.machine';

describe.concurrent('Legacy Options Access', () => {
  test('#01 => should access previous actions via _legacy', async () => {
    const machine = _machine1;

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

    await service.send('NEXT');
    expect(service.state.context).toBe(1);

    await service.send('DOUBLE');
    expect(service.state.context).toBe(3);
  });

  test('#02 => should access previous actions via _legacy, replace the same action', async () => {
    const machine = _machine2;

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

    await service.send('NEXT');
    expect(service.state.context).toBe(2);

    await service.send('NEXT');
    expect(service.state.context).toBe(4);
  });

  test('#03 =>should access previous predicates via _legacy', async () => {
    const machine = _machine3;

    // First call - define isPositive
    machine.addOptions(() => ({
      guards: {
        isPositive: ({ context }) => context > 0,
      },
    }));

    // Second call - access and extend with isNegative using _legacy
    machine.addOptions((_, { _legacy }) => {
      const previousPredicates = _legacy.predicates;
      expect(previousPredicates?.isPositive).toBeDefined();

      return {
        guards: {
          isNegative: ({ context }) => context < 0,
        },
      };
    });

    const service = interpret(machine, { context: 5 });

    service.start();
    expect(service.state.value).toBe('idle');

    await service.send('CHECK');
    expect(service.state.value).toBe('positive');
  });

  test('#04 => should work with provideOptions', async () => {
    const machine = _machine4.provideOptions(({ assign }) => ({
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

    await service.send('ADD');
    expect(service.state.context).toBe(3);

    await service.send('MULTIPLY');
    expect(service.state.context).toBe(6);
  });

  test('#05 => _legacy should be immutable', async () => {
    const machine = _machine5;

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

  test('#06 => should handle multiple calls with cumulative legacy', async () => {
    const machine = _machine6;

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

    await service.send('FIRST');
    expect(service.state.context).toBe(1);

    await service.send('SECOND');
    expect(service.state.context).toBe(11);

    await service.send('THIRD');
    expect(service.state.context).toBe(111);
  });

  describe('#07 => Service (Interpreter) addOptions', () => {
    test('#01 => should access previous actions via _legacy on service.addOptions', async () => {
      const machine = _machine7;

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

      await service.send('NEXT');
      expect(service.state.context).toBe(1);

      await service.send('TRIPLE');
      expect(service.state.context).toBe(4);
    });

    test('#02 => should access previous actions via _legacy on service.addOptions, changes the same action', async () => {
      const machine = _machine8;

      const service = interpret(machine, { context: 0 });

      // First call to service.addOptions - define increment
      service.addOptions(({ assign }) => ({
        actions: {
          increment: assign('context', ({ context }) => context + 1),
        },
      }));

      service.start();
      expect(service.state.context).toBe(0);

      await service.send('NEXT');
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

      await service.send('NEXT');
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

      await service.send('NEXT');
      expect(service.state.context).toBe(9);
    });

    test('#03 => should access previous predicates via _legacy on service.addOptions', async () => {
      const machine = _machine9;

      const service = interpret(machine, { context: 5 });

      // First call - define isPositive
      service.addOptions(() => ({
        guards: {
          isPositive: ({ context }) => context > 0,
        },
      }));

      // Second call - access and extend with isNegative using _legacy
      service.addOptions((_, { _legacy }) => {
        const previousPredicates = _legacy.predicates;
        expect(previousPredicates?.isPositive).toBeDefined();

        return {
          guards: {
            isNegative: ({ context }) => context < 0,
          },
        };
      });

      service.start();
      expect(service.state.value).toBe('idle');

      await service.send('CHECK');
      expect(service.state.value).toBe('positive');
    });

    test('#04 => should handle cumulative legacy on service.addOptions', async () => {
      const machine = _machine10;

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

      await service.send('FIRST');
      expect(service.state.context).toBe(5);

      await service.send('SECOND');
      expect(service.state.context).toBe(25);
    });
  });

  describe('#08 => Service (Interpreter) provideOptions', () => {
    test('#01 => should access previous actions via _legacy on service.provideOptions', async () => {
      const machine = _machine11;

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

      await service3.send('ADD');
      expect(service3.state.context).toBe(4);

      await service3.send('MULTIPLY');
      expect(service3.state.context).toBe(8);
    });

    test('#02 => should return new service instance with provideOptions', async () => {
      const machine = _machine12;

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
      await service1.send('INCREMENT');
      expect(service1.state.context).toBe(0); // No change

      // service2 should have the increment action
      service2.start();
      await service2.send('INCREMENT');
      expect(service2.state.context).toBe(1);
    });

    test('#03 => should chain provideOptions with cumulative legacy', async () => {
      const machine = _machine13;

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

      await service4.send('OP1');
      expect(service4.state.context).toBe(1);

      await service4.send('OP2');
      expect(service4.state.context).toBe(11);

      await service4.send('OP3');
      expect(service4.state.context).toBe(111);
    });

    test('#04 => should preserve context and pContext across provideOptions', async () => {
      const machine = _machine14;

      const service1 = interpret(machine, { context: 10 });

      const service2 = service1.provideOptions(({ assign }) => ({
        actions: {
          increment: assign('context', ({ context }) => context + 5),
        },
      }));

      // Verify initial context is preserved
      service2.start();
      expect(service2.state.context).toBe(10);

      await service2.send('INCREMENT');
      expect(service2.state.context).toBe(15);
    });
  });
});
