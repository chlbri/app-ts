import { t } from '@bemedev/types';
import { type ActionConfig } from '~actions';
import { type PromiseConfig } from '~promises';
import { type TransitionConfig } from '~transitions';
import { identify, toArray } from '~utils';
import { stateType } from './getStateType';
import { toAction } from './toAction';
import { toPromise } from './toPromise';
import { toTransition } from './toTransition';
import type { ResolveNode_F } from './types';

export const resolveNode: ResolveNode_F = ({
  events,
  config,
  options,
  mode,
}) => {
  // #region functions
  const aMapper = (action: any) => {
    return toAction({
      events,
      action,
      actions: options?.actions,
      mode,
    });
  };

  const tMapper = (config: any) => {
    return toTransition({ events, config, options, mode });
  };
  // #endregion

  const { id, description, initial, tags: _tags } = config;
  const __id = (config as any).__id;
  const type = stateType(config);
  const tags = toArray<string>(_tags);
  const entry = toArray<ActionConfig>(config.entry).map(aMapper);
  const exit = toArray<ActionConfig>(config.exit).map(aMapper);

  const states = identify(config.states).map(config =>
    resolveNode({ events, config, options, mode }),
  );

  const on = identify(config.on).map(tMapper);
  const always = toArray<TransitionConfig>(config.always).map(tMapper);
  const after = identify(config.after).map(tMapper);
  const promises = toArray<PromiseConfig>(config.promises).map(promise =>
    toPromise({ events, promise, options, mode }),
  );

  const out = t.anify<any>({
    type,
    entry,
    exit,
    tags,
    states,
    on,
    always,
    after,
    promises,
  });

  if (__id) out.__id = __id;
  if (initial) out.initial = initial;
  if (id) out.id = id;
  if (description) out.description = description;

  return out;
};
