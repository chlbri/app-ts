import { createMachine } from '#machine';
import { defaultT } from '#fixtures';

export default createMachine('src/__tests__/guards/index.3.machine',
      {
        initial: 'state1',
        states: {
          state1: {
            always: {
              guards: { name: 'guard1', description: 'Just a guard' },
              target: '/state2',
            },
          },
          state2: {
            on: {
              NEXT: '/state1',
            },
          },
        },
      },
      {
        ...defaultT,
        eventsMap: {
          NEXT: {},
        },
      },
    );
