import { DEFAULT_SERVICE } from '../interpreters/interpreter.js';
import { DEFAULT_MACHINE } from '../machine/machine.js';
import { options, _fn0 } from './typings.js';

const typingsMachine = options(DEFAULT_MACHINE);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const interpret = _ => _fn0();
interpret.default = DEFAULT_SERVICE;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interpret.typings = _ => _fn0();
const typingsExtended = {
  machine: options(DEFAULT_MACHINE),
  interpret,
};

export { typingsExtended, typingsMachine };
//# sourceMappingURL=typings.extended.js.map
