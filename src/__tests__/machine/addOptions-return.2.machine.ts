import { createMachine } from '#machine';
import { typings } from '#utils';

export default createMachine('src/__tests__/machine/addOptions-return.2.machine',
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
