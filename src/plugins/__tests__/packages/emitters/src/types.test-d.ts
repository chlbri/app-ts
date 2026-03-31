import { MachineOptions } from '@bemedev/app-ts';
import { NotUndefined } from './rexport';

type TK1 = keyof NotUndefined<MachineOptions['actors']>;

expectTypeOf<TK1>().toEqualTypeOf<
  'promises' | 'emitters' | 'children'
>();
