import type { AlwaysEvent, InitEvent } from '~events';
import type {
  CatchEvent,
  MaxExceededEvent,
  ThenEvent,
} from '../../constants/events';
import type {
  ActionKeysFrom,
  ConfigFrom,
  ContextFrom,
  DelayKeysFrom,
  EventsFrom,
  EventsMapFrom,
  GuardKeysFrom,
  MachineKeysFrom,
  PrivateContextFrom,
  PromiseKeysFrom,
} from '../../machine/types';
import { Config1, Machine1 } from './fixtures';

type TTConfig = ConfigFrom<Machine1>;

expectTypeOf<TTConfig>().toEqualTypeOf<Config1>();

type TTPrivate = PrivateContextFrom<Machine1>;
expectTypeOf<TTPrivate>().toEqualTypeOf<{
  data: string;
}>();

type TTC = ContextFrom<Machine1>;
expectTypeOf<TTC>().toEqualTypeOf<{
  age: number;
}>();

type TTEm = EventsMapFrom<Machine1>;
expectTypeOf<TTEm>().toEqualTypeOf<{
  AUTH: {
    password: string;
    username: string;
  };
  SEND: string;
}>();

type TTE = EventsFrom<Machine1>;
expectTypeOf<TTE>().toEqualTypeOf<
  | {
      type: 'AUTH';
      payload: {
        password: string;
        username: string;
      };
    }
  | {
      type: 'SEND';
      payload: string;
    }
  | InitEvent
  | AlwaysEvent
  | ThenEvent
  | CatchEvent
  | MaxExceededEvent
>();

type ActionKeys = ActionKeysFrom<Machine1>;
expectTypeOf<ActionKeys>().toEqualTypeOf<
  | 'action1'
  | 'dodo3'
  | 'doré1'
  | 'dodo5'
  | 'dodo1'
  | 'doré'
  | 'dodo2'
  | 'dodo6'
  | 'dodo7'
  | 'doré3'
  | 'deal'
  | 'deal17'
>();

type GuardKeys = GuardKeysFrom<Machine1>;
expectTypeOf<GuardKeys>().toEqualTypeOf<
  'guard' | 'guard2' | 'ert' | 'guar34' | 'guard4'
>();

type DelayKeys = DelayKeysFrom<Machine1>;
expectTypeOf<DelayKeys>().toEqualTypeOf<
  'DELAY' | 'DELAY2' | 'DELAY3' | 'DELAY5' | 'DELAY17'
>();

type PromiseKeys = PromiseKeysFrom<Machine1>;
expectTypeOf<PromiseKeys>().toEqualTypeOf<'promise1' | 'promise2'>();

type MachineKeys = MachineKeysFrom<Machine1>;
expectTypeOf<MachineKeys>().toEqualTypeOf<'machine1'>();
