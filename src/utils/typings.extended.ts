import {
  DEFAULT_SERVICE,
  type AnyInterpreter2,
  type InterpreterFrom,
} from '~interpreter';
import { DEFAULT_MACHINE } from '~machine';
import type { AnyMachine } from '~machines';
import { _fn0, options } from './typings';

export const typingsMachine = options(DEFAULT_MACHINE);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const interpret = <T extends AnyMachine>(_?: T): InterpreterFrom<T> =>
  _fn0();

interpret.default = DEFAULT_SERVICE;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interpret.typings = <T extends AnyInterpreter2>(_?: T): T => _fn0();

export const typingsExtended = {
  machine: options(DEFAULT_MACHINE),
  interpret,
};
