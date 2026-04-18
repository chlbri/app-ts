import { createMachine } from '#machine';
import { typings } from '#utils';

export default createMachine(
  'src/__tests__/actions/action.batch.cov.machine',
  {
    initial: 'idle',
    states: {
      idle: {
        on: {
          INC1: {
            actions: 'inc1',
          },
          INC2: {
            actions: 'inc2',
          },
          INC5: {
            actions: 'inc5',
          },
        },
      },
    },
  },
  typings({
    eventsMap: {
      INC1: 'primitive',
      INC2: 'primitive',
      INC5: 'primitive',
    },
    context: 'number',
  }),
);
