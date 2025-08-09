import { DEFAULT_MACHINE } from '../machine/machine.constants.js';
import { interpret } from './interpreter.js';

const DEFAULT_SERVICE = interpret(DEFAULT_MACHINE, {
  context: {
    iterator: 0,
  },
  pContext: {},
});

export { DEFAULT_SERVICE };
//# sourceMappingURL=interpreter.constants.js.map
