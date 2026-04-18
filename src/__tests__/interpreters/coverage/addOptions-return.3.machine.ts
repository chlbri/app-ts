import { createMachine } from '#machine';
import { typings } from '#utils';

export default createMachine('src/__tests__/interpreters/coverage/addOptions-return.3.machine',
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
