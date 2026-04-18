import { createMachine } from '#machine';

export default createMachine(
  'src/__tests__/interpreters/activities/perform.bis.machine',
  {
    entry: 'init',
    initial: 'idle',
    states: {
      idle: {
        on: {
          DECREMENT: { actions: 'dec' },
          INCREMENT: { actions: 'inc' },
          REDECREMENT: { actions: 'sendDec' },
          NEXT: '/next',
        },
      },
      next: {
        on: {
          NEXT: '/idle',
          'INCREMENT.FORCE': { actions: 'forceSendInc' },
          REDECREMENT: { actions: 'sendDec' },
        },
      },
    },
  },
);
