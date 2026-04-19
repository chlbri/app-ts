import { createMachine } from '#machine';
import { typings } from '#utils';

export default createMachine(
  'src/__tests__/interpreters/filter-erase.3.machine',
  {
    initial: 'idle',
    states: {
      idle: {
        on: {
          SET_SCORES: {
            actions: 'setScores',
          },
          FILTER_HIGH_SCORES: {
            actions: 'filterHighScores',
            target: '/filtered',
          },
        },
      },
      filtered: {},
    },
  },
  { context: { scores: typings.record('number') } },
);
