import type { DeepReadonly } from '@bemedev/types/lib/types/objects.types';
import type { InitEvent, MaxExceededEvent } from '~events';
import type {
  ActionKeysFrom,
  ChildrenKeysFrom,
  ConfigFrom,
  ContextFrom,
  DelayKeysFrom,
  EventsFrom,
  EventsMapFrom,
  GuardKeysFrom,
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
expectTypeOf<TTEm>().toEqualTypeOf<
  DeepReadonly<{
    EVENT: {
      password: string;
      username: string;
    };
    EVENT2: boolean;
    EVENT3: {
      login: string;
      pwd: string;
    };
  }>
>();

type TTE = EventsFrom<Machine3>;
expectTypeOf<TTE>().toEqualTypeOf<
  | {
      type: 'EVENT';
      payload: {
        readonly password: string;
        readonly username: string;
      };
    }
  | {
      type: 'EVENT3';
      payload: {
        readonly login: string;
        readonly pwd: string;
      };
    }
  | {
      type: 'EVENT2';
      payload: boolean;
    }
  | InitEvent
  | MaxExceededEvent
>();

type ActionKeys = ActionKeysFrom<Machine3>;
expectTypeOf<ActionKeys>().branded.toEqualTypeOf<
  | 'deal'
  | 'deal17'
  | 'dodo1'
  | 'doré'
  | 'dodo2'
  | 'dodo3'
  | 'doré1'
  | 'dodo5'
  | 'dodo6'
  | 'dodo7'
  | 'doré3'
  | 'action1'
  | 'action14'
  | 'action13'
  | 'action22'
  | 'action4'
  | 'action3'
  | 'action15'
  | 'action12'
  | 'action20'
>();

type GuardKeys = GuardKeysFrom<Machine3>;
expectTypeOf<GuardKeys>().toEqualTypeOf<
  'guard' | 'guard2' | 'ert' | 'guar34' | 'guard4'
>();

type DelayKeys = DelayKeysFrom<Machine3>;
expectTypeOf<DelayKeys>().toEqualTypeOf<
  'DELAY' | 'DELAY2' | 'DELAY3' | 'DELAY5' | 'DELAY17'
>();

type PromiseKeys = PromiseKeysFrom<Machine3>;
expectTypeOf<PromiseKeys>().toEqualTypeOf<'promise1' | 'promise2'>();

type MachineKeys = ChildrenKeysFrom<Machine3>;
expectTypeOf<MachineKeys>().toEqualTypeOf<'machine1'>();
