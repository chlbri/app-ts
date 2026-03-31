import type { AddOptionHelper_Fn } from './addOptions';
import type {
  NEXT_ORDERED_FNS,
  PAUSE_ORDERED_FNS,
  RESUME_ORDERED_FNS,
  START_ORDERED_FNS,
  STOP_ORDERED_FNS,
} from './constants';
import type { InitHelper_Fn } from './init';
import type { ResolveNodeHelper_Fn } from './resolveNode';
import type { TimesPlugin_Fn } from './times';

export type PluginConfig = {
  addOptions?: AddOptionHelper_Fn;
  init?: InitHelper_Fn;
  next?: TimesPlugin_Fn<typeof NEXT_ORDERED_FNS>;
  pause?: TimesPlugin_Fn<typeof PAUSE_ORDERED_FNS>;
  resolveNode?: ResolveNodeHelper_Fn;
  resume?: TimesPlugin_Fn<typeof RESUME_ORDERED_FNS>;
  start?: TimesPlugin_Fn<typeof START_ORDERED_FNS>;
  stop?: TimesPlugin_Fn<typeof STOP_ORDERED_FNS>;
};
