import type {
  DelayedTransitions,
  GetEventKeysFromDelayed,
  GetEventKeysFromTransitions,
  TransitionsConfig,
} from './types';

// #region Delayed Keys
const ttest1 = {
  START: { actions: '/state1' },
  END: [{ guards: 'guard1', actions: 'build1' }, { actions: 'd' }],
} as const satisfies DelayedTransitions;

type TTest1 = GetEventKeysFromDelayed<typeof ttest1>;

expectTypeOf<TTest1>().toEqualTypeOf<'START' | 'END.[0]' | 'END.[1]'>();
// #endregion

// #region Transitions Keys

const ttest2 = {
  on: {
    START: { actions: '/state1' },
    END: [{ guards: 'guard1', actions: 'build1' }, { actions: 'd' }],
  },
  after: {
    START: { actions: '/state2' },
    END: [{ guards: 'guard2', actions: 'build2' }, { actions: 'e' }],
  },
} as const satisfies TransitionsConfig;

type TTest2 = GetEventKeysFromTransitions<typeof ttest2>;

expectTypeOf<TTest2>().toEqualTypeOf<
  | 'on.START'
  | 'on.END.[0]'
  | 'on.END.[1]'
  | 'after.START'
  | 'after.END.[0]'
  | 'after.END.[1]'
>();

//Create tests with promises
const ttest3 = {
  on: {
    START: { actions: '/state1' },
    END: [{ guards: 'guard1', actions: 'build1' }, { actions: 'd' }],
  },
  after: {
    START: { actions: '/state2' },
    END: [{ guards: 'guard2', actions: 'build2' }, { actions: 'e' }],
  },
  always: [
    { guards: 'guard3', actions: 'build3', target: '/state' },
    { actions: 'f', target: '/state' },
  ],
  promises: [
    {
      src: 'source1',
      then: [{ guards: 'guard4', actions: 'build4' }, { actions: 'g' }],
      catch: [{ guards: 'guard5', actions: 'build5' }, { actions: 'h' }],
      finally: [{ guards: 'guard6', actions: 'build6' }, { actions: 'i' }],
    },
    {
      src: 'source2',
      then: [{ guards: 'guard7', actions: 'build7' }, { actions: 'j' }],
      catch: [{ guards: 'guard8', actions: 'build8' }, { actions: 'k' }],
      finally: [{ guards: 'guard9', actions: 'build9' }, { actions: 'l' }],
    },
  ],
} as const satisfies TransitionsConfig;

type TTest3 = GetEventKeysFromTransitions<typeof ttest3>;

expectTypeOf<TTest3>().toEqualTypeOf<
  | 'on.START'
  | 'on.END.[0]'
  | 'on.END.[1]'
  | 'after.START'
  | 'after.END.[0]'
  | 'after.END.[1]'
  | 'always.[0]'
  | 'always.[1]'
  | 'promises.[0].then.[0]'
  | 'promises.[0].then.[1]'
  | 'promises.[0].catch.[0]'
  | 'promises.[0].catch.[1]'
  | 'promises.[1].then.[0]'
  | 'promises.[1].then.[1]'
  | 'promises.[1].catch.[0]'
  | 'promises.[1].catch.[1]'
>();
// #endregion
