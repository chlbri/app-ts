import type {
  CatchEvent,
  MaxExceededEvent,
  ThenEvent,
} from 'src/machine/constants';
import type {
  AlwaysEvent,
  InitEvent,
} from 'src/machine/interpreter.types';
import type { ToEvents } from './types';

type TT1 = ToEvents<{
  AUTH: { userName: string; password: string };
  MODIFY: { data?: any };
}>;

expectTypeOf<TT1>().toEqualTypeOf<
  | {
      type: 'AUTH';
      payload: {
        userName: string;
        password: string;
      };
    }
  | {
      type: 'MODIFY';
      payload: {
        data?: any;
      };
    }
  | InitEvent
  | AlwaysEvent
  | ThenEvent
  | CatchEvent
  | MaxExceededEvent
>();
