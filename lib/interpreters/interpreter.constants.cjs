'use strict';

var machine_machine_constants = require('../machine/machine.constants.cjs');
var interpreters_interpreter = require('./interpreter.cjs');

const DEFAULT_SERVICE = interpreters_interpreter.interpret(
  machine_machine_constants.DEFAULT_MACHINE,
  {
    context: {
      iterator: 0,
    },
    pContext: {},
  },
);

exports.DEFAULT_SERVICE = DEFAULT_SERVICE;
//# sourceMappingURL=interpreter.constants.cjs.map
