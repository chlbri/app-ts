'use strict';

require('@bemedev/decompose');
require('fast-deep-equal');
require('../utils/environment.cjs');
require('../utils/merge.cjs');
require('../constants/errors.cjs');
require('@bemedev/types');
var utils_typings = require('../utils/typings.cjs');
var machine_machine = require('./machine.cjs');

const DEFAULT_MACHINE = machine_machine
  .createMachine(
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
    utils_typings.default({
      eventsMap: { SWITCH: 'primitive' },
      context: { iterator: 'number' },
    }),
    { '/': 'off' },
  )
  .provideOptions(({ assign }) => ({
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

exports.DEFAULT_MACHINE = DEFAULT_MACHINE;
//# sourceMappingURL=machine.constants.cjs.map
