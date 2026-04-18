import { createConfig } from '#machines';
import type { FlatMapN } from '#states';

const config = createConfig({
  initial: 'atomic',
  states: {
    atomic: {},
    compound: {
      initial: 'state1',
      states: {
        state1: {},
        state2: {},
      },
    },
    parallel: {
      type: 'parallel',
      states: {
        atomic: {
          initial: 'state1',
          states: {
            state1: {},
            state2: {},
          },
        },
        compound: {
          initial: 'state1',
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
