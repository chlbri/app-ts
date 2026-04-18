import { createMachine } from '#machine';
import { typings } from '#utils';

export default createMachine('src/__tests__/interpreters/coverage/addOptions-return.2.machine',
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
