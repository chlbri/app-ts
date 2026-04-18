import { createMachine } from '#machine';

export default createMachine('src/__tests__/machine/real.3.machine', {
  initial: 'idle',
  states: {
    idle: {
      entry: 'prepare',
      always: '/working',
    },
    working: {
      on: {
        CHANGE_LANG: {
          actions: ['changeLang'],
        },
        REMOVE: {
          actions: ['remove'],
        },
        ADD: {
          actions: ['add'],
        },
        UPDATE: {
          actions: 'update',
        },
        'UPDATE:NOW': {
          actions: 'update:now',
        },
        'FIELDS:REGISTER': {
          actions: ['fields.register', 'fields.register.finish'],
          target: '/working/register',
        },
        'FIELDS:MODIFY': {
          actions: ['fields.modify'],
          target: '/working/idle',
        },
      },

      initial: 'idle',

      states: {
        idle: {},

        register: {
          on: {
            'VALUES:REGISTER': {
              actions: [
                'values.start.register',
                'values.register',
                'values.register.finish',
              ],
            },
            'VALUES:MODIFY': {
              actions: ['values.modify'],
            },
          },
        },
      },
    },
  },
});
