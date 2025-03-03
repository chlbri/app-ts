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
  GuardsFrom,
  MachineKeysFrom,
  PrivateContextFrom,
  PromiseKeysFrom,
} from '../../machine/types';
import type { Config3, Machine3 } from './data/machine3';

type TTConfig = ConfigFrom<Machine3>;

expectTypeOf<TTConfig>().toEqualTypeOf<Config3>();

type TTPrivate = PrivateContextFrom<Machine3>;
expectTypeOf<TTPrivate>().toEqualTypeOf<{
  data: string;
}>();

type TTC = ContextFrom<Machine3>;
expectTypeOf<TTC>().toEqualTypeOf<{
  age: number;
}>();

type TTEm = EventsMapFrom<Machine3>;
expectTypeOf<TTEm>().toEqualTypeOf<{
  EVENT: {
    password: string;
    username: string;
  };
  EVENT2: boolean;
  EVENT3: {
    login: string;
    pwd: string;
  };
}>();

type TTE = EventsFrom<Machine3>;
expectTypeOf<TTE>().toEqualTypeOf<
  | {
      type: 'EVENT';
      payload: {
        password: string;
        username: string;
      };
    }
  | {
      type: 'EVENT3';
      payload: {
        login: string;
        pwd: string;
      };
    }
  | {
      type: 'EVENT2';
      payload: boolean;
    }
  | InitEvent
  | AlwaysEvent
  | ThenEvent
  | CatchEvent
  | MaxExceededEvent
>();

type ActionKeys = ActionKeysFrom<Machine3>;
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

type GuardKeys = keyof GuardsFrom<Machine3>;
expectTypeOf<GuardKeys>().toEqualTypeOf<
  'guard' | 'guard2' | 'ert' | 'guar34' | 'guard4'
>();

type DelayKeys = DelayKeysFrom<Machine3>;
expectTypeOf<DelayKeys>().toEqualTypeOf<
  'DELAY' | 'DELAY2' | 'DELAY3' | 'DELAY5' | 'DELAY17'
>();

type PromiseKeys = PromiseKeysFrom<Machine3>;
expectTypeOf<PromiseKeys>().toEqualTypeOf<'promise1' | 'promise2'>();

type MachineKeys = MachineKeysFrom<Machine3>;
expectTypeOf<MachineKeys>().toEqualTypeOf<'machine1'>();
