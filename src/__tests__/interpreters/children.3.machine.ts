import { createMachine } from '#machine';
import { defaultT } from '#fixtures';
import num from '#bemedev/features/numbers/typings';

export default createMachine(
  'src/__tests__/interpreters/children.3.machine',
  {
    initial: 'idle',
    actors: {
      child: {
        contexts: {
          '.': 'iterator',
        },
      },
    },
    states: {
      idle: {},
      working: {
        on: {
          NEXT: '/idle',
        },
      },
    },
  },
  {
    ...defaultT,
    pContext: { iterator: num.type },
    eventsMap: { NEXT: {} },
    actorsMap: {
      ...defaultT.actorsMap,
      children: {
        child: {},
      },
    },
  },
);
