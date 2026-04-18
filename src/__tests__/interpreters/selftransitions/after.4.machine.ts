import { createMachine } from '#machine';
import { defaultT } from '#fixtures';

export default createMachine('src/__tests__/interpreters/selftransitions/after.4.machine',
      {
        initial: 'idle',
        states: {
          idle: {
            after: {
              DELAY2: '/active',
            },
            on: {
              NEXT: '/active',
            },
          },
          active: {
            on: {
              NEXT: '/idle',
            },
          },
        },
      },
      { ...defaultT, eventsMap: { NEXT: {} } },
    );
