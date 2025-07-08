import type { UnionToIntersection } from '@bemedev/types/lib/types/types';
import type { STR } from './types';

const action = {
  normal: 'action',
  capital: 'Action',
} as const satisfies STR;

const guard = {
  normal: 'guard',
  capital: 'Guard',
} as const satisfies STR;

const delay = {
  normal: 'delay',
  capital: 'Delay',
} as const satisfies STR;

const promise = {
  normal: 'promise',
  capital: 'Promise',
} as const satisfies STR;

const machine = {
  normal: 'machine',
  capital: 'Machine',
} as const satisfies STR;

const notDefined = 'is undefined' as const;
const notDescribed = 'is not described' as const;
const notProvided = 'is not provided' as const;

const notDefinedF = <T extends string>(type: T) => {
  const string = `${type} ${notDefined}` as const;
  return { string, error: new Error(string) };
};

const notDescribedF = <T extends string>(type: T) => {
  const string = `${type} ${notDescribed}` as const;
  return { string, error: new Error(string) };
};

const notProvidedF = <T extends string>(type: T) => {
  const string = `${type} ${notProvided}` as const;
  return { string, error: new Error(string) };
};

const produceErrors = <const T extends STR[]>(...types: T) => {
  const out = {};

  types.forEach(value => {
    Object.assign(out, {
      [value.normal]: {
        notDefined: notDefinedF(value['capital']),
        notDescribed: notDescribedF(value['capital']),
        notProvided: notProvidedF(value['capital']),
      },
    });
  });

  type Out = T[number] extends infer N extends STR
    ? N extends any
      ? {
          [key in N['normal']]: {
            notDefined: ReturnType<typeof notDefinedF<N['capital']>>;
            notDescribed: ReturnType<typeof notDescribedF<N['capital']>>;
            notProvided: ReturnType<typeof notProvidedF<N['capital']>>;
          };
        }
      : never
    : never;

  return out as UnionToIntersection<Out>;
};

/**
 * Contains error messages for various machine components.
 * Each component (action, guard, delay, promise, machine) has three types of errors:
 * - `notDefined`: Indicates that the component is not defined.
 * - `notDescribed`: Indicates that the component is not described.
 * - `notProvided`: Indicates that the component is not provided.
 */
export const ERRORS = produceErrors(
  action,
  guard,
  delay,
  promise,
  machine,
);
