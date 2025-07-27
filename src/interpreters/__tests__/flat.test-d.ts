import { createConfig } from '~machines';
import type { FlatMapN } from '~states';

const config = createConfig({
  states: {
    atomic: {},
    compound: {
      states: {
        state1: {},
        state2: {},
      },
    },
    parallel: {
      states: {
        atomic: {
          states: {
            state1: {},
            state2: {},
          },
        },
        compound: {
          states: {
            state1: {},
            state2: {},
          },
        },
      },
    },
  },
});

type KeyConfig1 = keyof FlatMapN<typeof config>;

expectTypeOf<KeyConfig1>().toEqualTypeOf<
  | '/'
  | '/atomic'
  | '/compound'
  | '/parallel'
  | '/compound/state1'
  | '/compound/state2'
  | '/parallel/atomic'
  | '/parallel/compound'
  | '/parallel/compound/state1'
  | '/parallel/compound/state2'
  | '/parallel/atomic/state1'
  | '/parallel/atomic/state2'
>();
