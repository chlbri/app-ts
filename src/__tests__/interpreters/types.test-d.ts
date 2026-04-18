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
} from '../../machine/types';
import type { Config3, Machine3 } from './data/machine3';

type TTConfig = ConfigFrom<Machine3>;

expectTypeOf<TTConfig>().toEqualTypeOf<Config3>();

type TTPrivate = PrivateContextFrom<Machine3>;
expectTypeOf<TTPrivate>().branded.toEqualTypeOf<{
  readonly data: string;
}>();

type TTC = ContextFrom<Machine3>;
expectTypeOf<TTC>().branded.toEqualTypeOf<{
  readonly age: number;
}>();

type TTEm = EventsMapFrom<Machine3>;
expectTypeOf<TTEm>().branded.toEqualTypeOf<{
  readonly EVENT: {
    readonly password: string;
    readonly username: string;
  };
  readonly EVENT2: boolean;
  readonly EVENT3: {
    readonly login: string;
    readonly pwd: string;
  };
}>();

type TTE = EventsFrom<Machine3>;
expectTypeOf<TTE>().branded.toEqualTypeOf<
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
>();

type ActionKeys =
  ActionKeysFrom<Machine3> extends infer P extends string
    ? {
        [K in P]: K;
      }[P]
    : never;
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
>();

type GuardKeys = GuardKeysFrom<Machine3>;
expectTypeOf<GuardKeys>().toEqualTypeOf<'guard2'>();

type DelayKeys = DelayKeysFrom<Machine3>;
expectTypeOf<DelayKeys>().toEqualTypeOf<
  'DELAY' | 'DELAY2' | 'DELAY3' | 'DELAY5' | 'DELAY17'
>();

type MachineKeys = ChildrenKeysFrom<Machine3>;
expectTypeOf<MachineKeys>().toEqualTypeOf<'machine1'>();
