import { isDefined } from '@bemedev/basifun';
import type {
  Asyncfy_F,
  CheckKeys_F,
  DefaultReturn,
  DeleteF_F,
  DeleteFirst_F,
  EscapeRexExp_F,
  Identify_F,
  RecomposeSV_F,
  ReplaceAll_F,
  ToArray_F,
  ToDescriber_F,
} from 'src/types/primitives';
import { isArray, isString } from 'src/types/primitives';
import {
  DEFAULT_DELIMITER,
  DEFAULT_NOTHING,
  ESCAPE_REGEXP,
} from '~constants';

export const toArray: ToArray_F = obj => {
  if (isArray(obj)) {
    return obj;
  } else {
    if (!obj) return [];
    return [obj];
  }
};

toArray.typed = toArray;

export const checkKeys: CheckKeys_F = (arg, ...keys) => {
  const argKeys = Object.keys(arg);
  for (const key of keys) {
    const check = !argKeys.includes(key);
    if (check) return false;
  }
  return true;
};

export const defaultReturn: DefaultReturn = ({
  config: { value, strict },
  _return,
  error,
}) => {
  if (_return) return _return;
  if (!strict) return value;
  throw error;
};

// @ts-expect-error no need to return
export const nothing = () => {
  if (IS_TEST) {
    console.log(`${DEFAULT_NOTHING} call ${DEFAULT_NOTHING}`);
    return DEFAULT_NOTHING;
  }
};

const env = process.env.NODE_ENV;

export const IS_TEST = env === 'test';
export const IS_PRODUCTION = env === 'production';

export const ERRORS = {
  noParams: { error: new Error('No params'), string: 'No params' },
};

// TODO: add to basifun
export const identify: Identify_F = arg => {
  if (!arg) return [];
  const entries = Object.entries(arg);

  const out: any[] = entries.map(([__id, value]) => {
    const out2 = { ...value, __id };
    return out2;
  });

  return out;
};

export const asyncfy: Asyncfy_F = fn => {
  return async (...args) => fn(...args);
};

export const toDescriber: ToDescriber_F = name => {
  const check = typeof name === 'object';
  if (check) {
    return name;
  }
  return { name };
};

export const isStringEmpty = (arg: unknown) => {
  return isString(arg) && arg.trim() === '';
};

export const escapeRegExp: EscapeRexExp_F = arg => {
  const replacer = '\\$&';
  return arg.replace(ESCAPE_REGEXP, replacer);
};

export const replaceAll: ReplaceAll_F = ({
  entry,
  match,
  replacement,
}) => {
  return entry.replace(
    new RegExp(escapeRegExp(match), 'g'),
    () => replacement,
  );
};

export const deleteFirst: DeleteFirst_F = (arg, toDelete) => {
  const check = arg.startsWith(toDelete);
  return check ? arg.substring(1) : arg;
};

export const deleteF: DeleteF_F = (arg, toDelete = DEFAULT_DELIMITER) =>
  deleteFirst(arg, toDelete);

export const recomposeSV: RecomposeSV_F = arg => {
  const check1 = !isDefined(arg) || isStringEmpty(arg);
  if (check1) return {};

  const arg1 = arg.startsWith(DEFAULT_DELIMITER) ? arg.substring(1) : arg;

  const splits = arg1.split(DEFAULT_DELIMITER);

  const check2 = splits.length === 1;
  if (check2) return arg;

  const first = splits.shift()!;

  const rest = splits.join(DEFAULT_DELIMITER);
  return { [first]: recomposeSV(rest) };
};
