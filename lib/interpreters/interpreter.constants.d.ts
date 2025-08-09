export declare const DEFAULT_SERVICE: import('./interpreter').InterpreterFrom<
  import('..').Machine<
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
    {
      iterator: number;
    },
    {
      SWITCH: {};
    },
    {},
    import('..').MachineOptions<
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
      {
        iterator: number;
      }
    >
  >
>;
//# sourceMappingURL=interpreter.constants.d.ts.map
