'use strict';

var interpreters_interpreter = require('../interpreters/interpreter.cjs');
var machine_machine = require('../machine/machine.cjs');
var utils_typings = require('./typings.cjs');

const typingsMachine = utils_typings.options(
  machine_machine.DEFAULT_MACHINE,
);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const interpret = _ => utils_typings._fn0();
interpret.default = interpreters_interpreter.DEFAULT_SERVICE;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interpret.typings = _ => utils_typings._fn0();
const typingsExtended = {
  machine: utils_typings.options(machine_machine.DEFAULT_MACHINE),
  interpret,
};

exports.typingsExtended = typingsExtended;
exports.typingsMachine = typingsMachine;
//# sourceMappingURL=typings.extended.cjs.map
