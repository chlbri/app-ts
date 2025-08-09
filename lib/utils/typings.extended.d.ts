import {
  type AnyInterpreter2,
  type InterpreterFrom,
} from '../interpreters/interpreter.js';
import type { AnyMachine } from '../machine/index.js';
export declare const typingsMachine: import('./typings').Options<
  import('../machine/machine.js').Machine<
    {
      readonly states: {
        readonly on: {
          readonly on: {
            readonly SWITCH: {
              readonly actions: 'inc';
              readonly target: '/off';
            };
          };
        };
        readonly off: {
          readonly on: {
            readonly SWITCH: {
              readonly actions: 'dec';
              readonly target: '/on';
            };
          };
        };
      };
    },
    {},
    Record<'iterator', number>,
    {
      SWITCH: {};
    },
    {},
    import('../machine/index.js').MachineOptions<
      {
        readonly states: {
          readonly on: {
            readonly on: {
              readonly SWITCH: {
                readonly actions: 'inc';
                readonly target: '/off';
              };
            };
          };
          readonly off: {
            readonly on: {
              readonly SWITCH: {
                readonly actions: 'dec';
                readonly target: '/on';
              };
            };
          };
        };
      },
      {
        SWITCH: {};
      },
      {},
      {},
      Record<'iterator', number>
    >
  >
>;
export declare const typingsExtended: {
  machine: import('./typings').Options<
    import('../machine/machine.js').Machine<
      {
        readonly states: {
          readonly on: {
            readonly on: {
              readonly SWITCH: {
                readonly actions: 'inc';
                readonly target: '/off';
              };
            };
          };
          readonly off: {
            readonly on: {
              readonly SWITCH: {
                readonly actions: 'dec';
                readonly target: '/on';
              };
            };
          };
        };
      },
      {},
      Record<'iterator', number>,
      {
        SWITCH: {};
      },
      {},
      import('../machine/index.js').MachineOptions<
        {
          readonly states: {
            readonly on: {
              readonly on: {
                readonly SWITCH: {
                  readonly actions: 'inc';
                  readonly target: '/off';
                };
              };
            };
            readonly off: {
              readonly on: {
                readonly SWITCH: {
                  readonly actions: 'dec';
                  readonly target: '/on';
                };
              };
            };
          };
        },
        {
          SWITCH: {};
        },
        {},
        {},
        Record<'iterator', number>
      >
    >
  >;
  interpret: {
    <T extends AnyMachine>(_?: T): InterpreterFrom<T>;
    default: InterpreterFrom<
      import('../machine/machine.js').Machine<
        {
          readonly states: {
            readonly on: {
              readonly on: {
                readonly SWITCH: {
                  readonly actions: 'inc';
                  readonly target: '/off';
                };
              };
            };
            readonly off: {
              readonly on: {
                readonly SWITCH: {
                  readonly actions: 'dec';
                  readonly target: '/on';
                };
              };
            };
          };
        },
        {},
        Record<'iterator', number>,
        {
          SWITCH: {};
        },
        {},
        import('../machine/index.js').MachineOptions<
          {
            readonly states: {
              readonly on: {
                readonly on: {
                  readonly SWITCH: {
                    readonly actions: 'inc';
                    readonly target: '/off';
                  };
                };
              };
              readonly off: {
                readonly on: {
                  readonly SWITCH: {
                    readonly actions: 'dec';
                    readonly target: '/on';
                  };
                };
              };
            };
          },
          {
            SWITCH: {};
          },
          {},
          {},
          Record<'iterator', number>
        >
      >
    >;
    typings<T extends AnyInterpreter2>(_?: T): T;
  };
};
//# sourceMappingURL=typings.extended.d.ts.map
