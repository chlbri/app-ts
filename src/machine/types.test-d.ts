import type { Fn, PrimitiveObject } from '#bemedev/globals/types';
import { EventStrings } from '#events';
import type { machine2 } from '#fixturesData';
import type {
  ChildEvents,
  Config,
  FnMapFrom,
  GetActorKeysFromConfig,
  GetEventsFromMachine,
} from './types';

type TT2 = keyof Exclude<FnMapFrom<typeof machine2>, Fn>;
expectTypeOf<TT2>().toEqualTypeOf<
  | EventStrings
  | 'NEXT'
  | 'else'
  | 'FINISH'
  | 'FETCH'
  | 'WRITE'
  | 'fetch::then'
  | 'fetch::catch'
  | 'machine1::on::NEXT'
>;

type GEFC2 = GetEventsFromMachine<typeof machine2>;
expectTypeOf<GEFC2>().toEqualTypeOf<{
  NEXT: PrimitiveObject;
  FINISH: PrimitiveObject;
  FETCH: PrimitiveObject;
  WRITE: PrimitiveObject;
}>();

const config = {
  actors: {
    machine11: {
      contexts: {},
      on: {
        NEXT: '/working',
        PREVIOUS: '/idle',
      },
    },
  },
  initial: 'idle',
  states: {
    idle: {
      actors: {
        machine122: {
          contexts: {},
          on: {
            NEXT2: '/working',
            PREVIOUS2: '/idle',
          },
        },
      },
    },
    working: {
      actors: {
        machine122: {
          contexts: {},
          on: {
            NEXT3: '/working',
          },
        },
      },
    },
  },
} as const satisfies Config;

type GAK1 = GetActorKeysFromConfig<typeof config>['children'];

expectTypeOf<GAK1>().toEqualTypeOf<{
  machine11: Record<'NEXT' | 'PREVIOUS', any>;
  machine122: Record<'NEXT2' | 'PREVIOUS2' | 'NEXT3', any>;
}>();

type CE1 = ChildEvents<
  'str',
  {
    children: {
      str: {
        NEXT: {};
        PREVIOUS: {};
      };
    };
    promisees: {
      data: {
        then: '/';
        catch: '/';
      };
    };
  }
>;

expectTypeOf<CE1>().toEqualTypeOf<{ NEXT: {}; PREVIOUS: {} }>();
