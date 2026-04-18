import { createMachine } from '#machine';
import { defaultT } from '#fixtures';

export default createMachine('src/__tests__/interpreters/composition.3.machine',
      {
        initial: 'idle',
        states: {
          idle: {
            after: {
              NEXT: { actions: 'inc' },
            },
          },
        },
      },
      defaultT,
    );
