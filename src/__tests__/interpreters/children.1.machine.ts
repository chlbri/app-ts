import { createMachine } from '#machine';
import { defaultT } from '#fixtures';
import num from '#bemedev/features/numbers/typings';

export default createMachine(
  'src/__tests__/interpreters/children.1.machine',
  {
    initial: 'idle',
    states: {
      idle: {
        activities: { DELAY: 'inc' },
      },
    },
  },
  { ...defaultT, context: num.type },
);
