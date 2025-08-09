export declare const DEFAULT_MACHINE: import('./machine').Machine<
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
  import('./types').MachineOptions<
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
>;
//# sourceMappingURL=machine.default.d.ts.map
