import { createMachine } from '#machine';
import { typings } from '#utils';

export default createMachine('src/__tests__/interpreters/legacy-options.13.machine',
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
