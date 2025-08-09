import '@bemedev/decompose';
import 'fast-deep-equal';
import '../utils/environment.js';
import '../utils/merge.js';
import '../constants/errors.js';
import '@bemedev/types';
import typings from '../utils/typings.js';
import { createMachine } from './machine.js';

const DEFAULT_MACHINE = createMachine(
  {
    states: {
      on: {
        on: {
          SWITCH: {
            actions: 'inc',
            target: '/off',
          },
        },
      },
      off: {
        on: {
          SWITCH: {
            actions: 'dec',
            target: '/on',
          },
        },
      },
    },
  },
  typings({
    eventsMap: { SWITCH: 'primitive' },
    context: { iterator: 'number' },
  }),
  { '/': 'off' },
).provideOptions(({ assign }) => ({
  actions: {
    inc: assign(
      'context.iterator',
      ({ context: { iterator } }) => iterator + 1,
    ),
    dec: assign(
      'context.iterator',
      ({ context: { iterator } }) => iterator - 1,
    ),
  },
}));

export { DEFAULT_MACHINE };
//# sourceMappingURL=machine.default.js.map
