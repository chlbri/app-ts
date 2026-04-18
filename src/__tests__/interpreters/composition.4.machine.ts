import { createMachine } from '#machine';
import { defaultT } from '#fixtures';

export default createMachine('src/__tests__/interpreters/composition.4.machine',
      {
        initial: 'idle',
        states: {
          idle: {
            after: {
              DELAY: { actions: 'inc2' },
            },
          },
        },
      },
      {
        ...defaultT,
        context: { iterator: 0 },
        actorsMap: {
          ...defaultT.actorsMap,
        },
      },
    );
