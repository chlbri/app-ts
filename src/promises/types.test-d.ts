import type { GetEventKeysFromPromisee, PromiseeConfig } from './types';

const ptest1 = {
  src: 'source1',
  then: [{ guards: 'guard1', actions: 'build1' }, 'd'],
  catch: [{ guards: 'guard2', actions: 'build2' }, 'e'],
  finally: [{ guards: 'guard3', actions: 'build3' }, 'f'],
} as const satisfies PromiseeConfig;

type PTest1 = GetEventKeysFromPromisee<typeof ptest1>;

expectTypeOf<PTest1>().toEqualTypeOf<
  'then.[0]' | 'then.[1]' | 'catch.[0]' | 'catch.[1]'
>();
