import { createMachine } from '#machine';
import { typings } from '#utils';

export default createMachine('src/__tests__/machine/longRuns.cov.5.machine',
      {
        __longRuns: true,
        initial: 'idle',
        states: {
          idle: { after: { DELAY: '/active' } },
          active: {},
        },
      },
      typings({ eventsMap: {}, context: 'number' }),
    );
