import { createMachine } from '#machine';
import { typings } from '#utils';

export default createMachine('src/__tests__/interpreters/composition.1.machine',
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

      typings({
        eventsMap: {
          ADD_CONDITION: 'primitive',
          REMOVE_CONDITION: 'primitive',
        },
        context: {
          condition: 'boolean',
          iterator: 'number',
        },
      }),
    );
