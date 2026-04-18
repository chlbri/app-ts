import { createMachine } from '#machine';
import { typings } from '#utils';

export default createMachine('src/__tests__/machine/longRuns.cov.3.machine',
      {
        initial: 'idle',
        states: {
          idle: {
            on: { TEST: { target: 'idle', actions: 'slowAction' } },
          },
        },
      },
      typings({ context: 'number', eventsMap: { TEST: 'primitive' } }),
    );
