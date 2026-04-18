import type {
  DelayedTransitions,
  ExtractChildKeysFromTransitions,
  ExtractEmitterSrcKeyFromTransitions,
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

//Create tests with emitters/children only
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
  actors: {
    em1: {
      next: '/dfdfd',
    },
    m1: {
      on: {
        EVENT1: { actions: 'action1' },
        EVENT34: [
          { guards: 'guard2', actions: 'build2' },
          { actions: 'e' },
        ],
      },
    },
  },
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
  | 'actors.em1.next'
  | 'actors.em1.error'
  | 'actors.m1.on.EVENT1'
  | 'actors.m1.on.EVENT34.[0]'
  | 'actors.m1.on.EVENT34.[1]'
>();
// #endregion

const transition1 = {
  actors: {
    machine111: {
      contexts: {},
      on: {
        NEXT: '/working',
        PREVIOUS: '/idle',
      },
    },
    machine122: {
      contexts: {},
      on: {
        NEXT2: '/working',
        PREVIOUS2: '/idle',
      },
    },
  },
} as const satisfies TransitionsConfig;

type TTS1 = ExtractChildKeysFromTransitions<typeof transition1>;

expectTypeOf<TTS1>().toEqualTypeOf<
  | {
      src: 'machine111';
      contexts: {};
      on: 'NEXT' | 'PREVIOUS';
    }
  | {
      src: 'machine122';
      contexts: {};
      on: 'NEXT2' | 'PREVIOUS2';
    }
>();

const transition2 = {
  actors: {
    machine111: {
      contexts: {},
      on: {
        NEXT: '/working',
        PREVIOUS: '/idle',
      },
    },
    emitter1: {
      next: '/',
    },
  },
} as const satisfies TransitionsConfig;

type TTS3 = ExtractEmitterSrcKeyFromTransitions<typeof transition2>;
expectTypeOf<TTS3>().toEqualTypeOf<'emitter1'>();

type TTS4 = ExtractChildKeysFromTransitions<typeof transition2>;
expectTypeOf<TTS4>().toEqualTypeOf<{
  src: 'machine111';
  contexts: {};
  on: 'NEXT' | 'PREVIOUS';
}>();
