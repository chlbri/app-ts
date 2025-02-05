import { isDefined } from '@bemedev/basifun';
import { decompose, decomposeKeys, recompose } from '@bemedev/decompose';
import { t } from '@bemedev/types';
import { isString } from 'src/types/primitives';
import { toAction, type ActionConfig } from '~actions';
import { DEFAULT_DELIMITER } from '~constants';
import { toPromise, type PromiseConfig } from '~promises';
import { toTransition, type TransitionConfig } from '~transitions';
import {
  deleteFirst,
  identify,
  isStringEmpty,
  recomposeSV,
  replaceAll,
  toArray,
  toDescriber,
} from '~utils';
import { recomposeNode } from './recompose';
import type {
  FlatMapState_F,
  GetInitialSimpleState_F,
  GetInitialStateConfig_F,
  GetInitialStateValue_F,
  GetNextSimple_F,
  GetNextStateConfig_F,
  GetStateType_F,
  NextStateValue_F,
  NodeToValue_F,
  ResolveState_F,
  StateNodeConfigAtomic,
  StateNodeConfigCompound,
  StateNodeConfigParallel,
  ToSimple_F,
  ToStateMap_F,
  ValueToNode_F,
} from './types';

/**
 * Transformer une machine à états hiérarchique en une structure plate où
 * chaque état est identifié par un chemin complet.
 * @param node  La configuration de la machine à états
 * @param delimiter  Le délimiteur à utiliser pour séparer les états,
 * par défaut '/'
 * @returns  La configuration de la machine à états sous forme plate
 * @example
 *
 * ```ts
 *  // Entrée
 *  const config = {
 *    initial: 'idle',
 *    states: {
 *      idle: {
 *        on: { START: 'running' }
 *      },
 *      running: {
 *        states: {
 *          fast: {},
 *          slow: {}
 *        }
 *      }
 *    }
 *  }
 *
 *  // Sortie
 *  flatMapMachine(config) =
 *    {
 *      '': { initial: 'idle' },
 *      '.idle': { on: { START: 'running' } },
 *      '.running': {},
 *      '.running.fast': {},
 *      '.running.slow': {}
 *    }
 * ```
 */
export const flatMapState: FlatMapState_F = (
  node,
  withChildren = true,
  delimiter = DEFAULT_DELIMITER,
  path = '',
) => {
  const { states, ...rest } = node;

  let out: any = {};
  out[path === '' ? DEFAULT_DELIMITER : path] = withChildren ? node : rest;

  if (states) {
    for (const key in states) {
      if (Object.prototype.hasOwnProperty.call(states, key)) {
        const element = states[key];
        const inner = flatMapState(
          element,
          withChildren,
          delimiter,
          `${path}${DEFAULT_DELIMITER}${key}`,
        );
        out = { ...out, ...inner };
      }
    }
  }

  return out;
};

export const getStateType: GetStateType_F = config => {
  const type = config.type;
  if (type) return type;
  const states = (config as any).states;
  if (states) {
    const len = Object.keys(states).length;
    if (len > 0) {
      return 'compound';
    }
  }

  return 'atomic';
};

export const toSimple: ToSimple_F = config => {
  const type = getStateType(config);
  const initial = config.initial;

  const entry = toArray<ActionConfig>(config.entry).map(toDescriber);
  const exit = toArray<ActionConfig>(config.exit).map(toDescriber);
  const tags = toArray<string>(config.tags);

  const _states = config.states;

  const out = t.anify<any>({ type, entry, exit, tags });

  if (initial !== undefined) out.initial = initial;

  const states: any[] = [];

  const check1 = isDefined(_states);

  if (check1) {
    const entries = Object.entries(_states);
    states.push(
      ...entries.map(([__id, state]) => {
        const value = { ...toSimple(state), __id };
        return value;
      }),
    );
  }
  out.states = states;

  return out;
};

export const resolveState: ResolveState_F = ({
  config,
  options,
  strict,
}) => {
  // #region functions
  const aMapper = (action: any) => {
    return toAction({
      action,
      actions: options?.actions,
      strict,
    });
  };

  const tMapper = (transition: any) => {
    return toTransition(transition, options, strict);
  };
  // #endregion

  const { id, description, initial, tags: _tags } = config;
  const __id = (config as any).__id;
  const type = getStateType(config);
  const tags = toArray<string>(_tags);
  const entry = toArray<ActionConfig>(config.entry).map(aMapper);
  const exit = toArray<ActionConfig>(config.exit).map(aMapper);
  const states = identify(config.states).map(config =>
    resolveState({ config, options, strict }),
  );
  const on = identify(config.on).map(tMapper);
  const always = toArray<TransitionConfig>(config.always).map(tMapper);
  const after = identify(config.after).map(tMapper);
  const promises = toArray<PromiseConfig>(config.promises).map(promise =>
    toPromise({ promise, options, strict }),
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

export const toStateMap: ToStateMap_F = node => {
  const { states } = node;
  const type = getStateType(node);

  if (states && Object.keys(states).length > 0) {
    const out = t.anify<any>({
      states: Object.keys(states).reduce((acc, key) => {
        Object.assign(acc, { [key]: toStateMap(states[key]) });
        return acc;
      }, {} as any),
      type,
    });
    return out;
  }
  return { type };
};

export function isParallel(arg: unknown): arg is StateNodeConfigParallel {
  return (arg as any).type === 'parallel';
}

export function isCompound(arg: any): arg is StateNodeConfigCompound {
  const out = getStateType(arg) === 'compound';
  return out;
}

export function isAtomic(arg: any): arg is StateNodeConfigAtomic {
  const out = getStateType(arg) === 'atomic';
  return out;
}

export const getInitialStateConfig: GetInitialStateConfig_F = body => {
  const check1 = isAtomic(body);
  if (check1) return body;

  const check2 = isParallel(body);

  const reducer = (
    body: StateNodeConfigCompound | StateNodeConfigParallel,
  ) => {
    const { states: states0, ...config } = body;
    const entries1 = Object.entries(states0);
    const entries2 = entries1.map(([key, state]) => {
      const check3 = isAtomic(state);
      if (check3) return t.tuple(key, state);
      return t.tuple(key, getInitialStateConfig(state));
    });

    const check4 = isCompound(body);
    if (check4) {
      const initial = body.initial;
      const entries3 = entries2.filter(([key]) => key === initial);

      const states = entries3.reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {} as any);

      const out = { ...config, states };

      return out;
    }

    const states = entries2.reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {} as any);

    const out = { ...config, states };

    return out;
  };
  if (check2) {
    const out = reducer(body);

    return out;
  }

  const __id = body.initial;

  const initial = body.states[__id];
  if (!initial) throw 'Initial is not defined';

  const check4 = isAtomic(initial);
  if (check4) {
    const out = { ...body, states: { [__id]: initial } };
    return out;
  }

  const out = { ...body, states: { [__id]: reducer(initial) } };
  return out;
};

export const getInitialSimpleState: GetInitialSimpleState_F = body => {
  const out1 = getInitialStateConfig(body);
  const out2 = toSimple(out1);

  return out2;
};

export const getInitialStateValue: GetInitialStateValue_F = _body => {
  const body = getInitialStateConfig(_body);

  return nodeToValue(body);
};

export const getParents = (str: string) => {
  const last = str.lastIndexOf(DEFAULT_DELIMITER);
  if (last === -1) return [];
  const out = [str];
  const str2 = str.substring(0, last);
  if (isStringEmpty(str2)) {
    return out;
  }

  out.push(...getParents(str2));
  return out;
};

export const getChildren = (str: string, ...keys: string[]) => {
  const check1 = keys.length > 0;
  const out: string[] = [];
  if (check1) {
    keys.forEach(key => {
      const check2 = str !== key;
      const check3 = key.includes(str);

      const check4 = check2 && check3;
      if (check4) {
        out.push(key);
      }
    });
  }

  return out;
};

export const valueToNode: ValueToNode_F = (body, from) => {
  const flatBody = flatMapState(body, false);
  const keysB = Object.keys(flatBody);
  const check1 = isString(from);
  if (check1) {
    const check2 = keysB.includes(from);
    if (check2) {
      const parents = getParents(from);
      const children = getChildren(from, ...keysB);

      const out1: any = {
        '/': flatBody['/'],
      };

      parents.concat(children).forEach(key => {
        out1[key] = (flatBody as any)[key];
      });

      const out: any = recomposeNode(out1);
      return out;
    }
    throw new Error(`${from} is not inside the body`);
  }

  const flatFrom = decompose(from);

  const entries1 = Object.entries<string>(flatFrom as any);

  const out1: any = {};

  entries1.forEach(([_key, value]) => {
    let key1 = _key;
    const check3 = !(Object.keys(value).length === 0);

    if (check3) {
      key1 = `${_key}.${value}`;
    }

    const key2 = replaceAll({
      entry: key1,
      match: '.',
      replacement: DEFAULT_DELIMITER,
    });

    const check4 = keysB.includes(key2);

    if (check4) {
      const all = getParents(key2);
      all.forEach(key => {
        out1[key] = (flatBody as any)[key];
      });
    }
  });

  const out2 = recompose(out1);
  return out2;
};

export const nodeToValue: NodeToValue_F = body => {
  const check1 = isAtomic(body);
  if (check1) return {};

  const reducer = (
    body: StateNodeConfigCompound | StateNodeConfigParallel,
  ) => {
    const entries = Object.entries(body.states);

    const check2 = isCompound(body);

    if (check2) {
      const length = entries.length;
      const __id = body.initial;
      const initial = body.states[__id];

      const check3 = length === 1;
      const check4 = isAtomic(initial);
      const check5 = check3 && check4;

      if (check5) return __id;
    }

    const entries2 = entries.map(([key, value]) => {
      const check1 = isAtomic(value);
      if (check1) {
        return t.tuple(key, {});
      }
      return t.tuple(key, nodeToValue(value));
    });

    const out = entries2.reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {} as any);

    return out;
  };

  const out = reducer(body);
  return out;
};

export const nextSV: NextStateValue_F = (from, target) => {
  const check0 = isStringEmpty(from);
  if (check0) return {};

  const checkT = isDefined(target);
  if (!checkT) return from;

  const check1 = isStringEmpty(target);
  if (check1) return from;

  const check2 = isString(from);

  if (check2) {
    const check31 = target.includes(`${from}/`);

    if (check31) {
      const out = recomposeSV(target);
      return out;
    }
    return target;
  }

  const keys = Object.keys(from);

  const check4 = keys.length === 0;
  if (check4) {
    return from;
  }

  const decomposed = decompose(from);

  const last = target.lastIndexOf(DEFAULT_DELIMITER);
  if (last === -1) return from;

  const entry = target.substring(0, last);

  const _target2 = replaceAll({
    entry,
    match: DEFAULT_DELIMITER,
    replacement: '.',
  });

  const target2 = deleteFirst(_target2, '.');
  const keysD = decomposeKeys(from);
  const check5 = keysD.includes(target2);

  if (check5) {
    decomposed[target2] = target.substring(last);
  } else return target;

  const out: any = recompose(decomposed);
  return out;
};

export const getNextStateConfig: GetNextStateConfig_F = ({
  from,
  body,
  to,
}) => {
  const nextValue = nextSV(from, to);

  return valueToNode(body, nextValue);
};

export const getNextSimple: GetNextSimple_F = params => {
  const out1 = getNextStateConfig(params);
  const out2 = toSimple(out1);

  return out2;
};
