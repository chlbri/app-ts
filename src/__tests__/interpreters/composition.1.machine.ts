import { createMachine } from '#machine';

export default createMachine(
  'src/__tests__/interpreters/composition.1.machine',
  {
    on: {
      ADD_CONDITION: { actions: 'addCondition' },
      REMOVE_CONDITION: { actions: 'removeCondition' },
    },
    initial: 'idle',
    states: {
      idle: {
        entry: 'inc',
        always: {
          guards: ['condition', 'limit'],
          target: '/working',
        },
        after: {
          DELAY: '/working',
        },
      },
      working: {
        entry: 'inc',
        always: {
          guards: ['condition', 'limit'],
          target: '/idle',
        },
        after: {
          DELAY: '/idle',
        },
      },
    },
  },
);
