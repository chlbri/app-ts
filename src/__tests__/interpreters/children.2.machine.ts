import { createMachine } from '#machine';
import { defaultT } from '#fixtures';
import num from '#bemedev/features/numbers/typings';

export default createMachine(
  'src/__tests__/interpreters/children.2.machine',
  {
    initial: 'idle',
    actors: {
      child: {
        contexts: {
          '.': '.',
        },
      },
    },
    states: {
      idle: {},
    },
  },
  {
    ...defaultT,
    pContext: num.type,
    actorsMap: {
      ...defaultT.actorsMap,
      children: {
        child: {},
      },
    },
  },
);
