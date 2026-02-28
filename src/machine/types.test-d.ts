import type { PrimitiveObject } from '#bemedev/globals/types';
import type { machine2 } from '#fixturesData';
import type {
  Config,
  FnMapFrom,
  GetActorKeysFromConfig,
  GetEventsFromMachine,
} from './types';

type TT2 = keyof FnMapFrom<typeof machine2>;
expectTypeOf<TT2>().toEqualTypeOf<
  | 'NEXT'
  | 'FINISH'
  | 'FETCH'
  | 'WRITE'
  | 'else'
  | 'machine11::on::NEXT'
  | 'fetch::then'
  | 'fetch::catch'
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
    id: 'machine1',
    src: 'machine11',
    contexts: {},
    on: {
      NEXT: '/working',
      PREVIOUS: '/idle',
    },
  },
  initial: 'idle',
  states: {
    idle: {
      actors: {
        id: 'machine122',
        src: 'machine12',
        contexts: {},
        on: {
          NEXT2: '/working',
          PREVIOUS2: '/idle',
        },
      },
    },
    working: {
      actors: {
        id: 'machine122',
        src: 'machine12',
        contexts: {},
        on: {
          NEXT3: '/working',
        },
      },
    },
  },
} as const satisfies Config;

type GAK1 = GetActorKeysFromConfig<typeof config>['children'];

expectTypeOf<GAK1>().toEqualTypeOf<{
  machine11: Record<'NEXT' | 'PREVIOUS', any>;
  machine12: Record<'NEXT2' | 'PREVIOUS2' | 'NEXT3', any>;
}>();
