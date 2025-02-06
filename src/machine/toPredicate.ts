import recursive from '@bemedev/boolean-recursive';
import { DEFAULT_NOTHING, ERRORS, GUARD_TYPE } from '~constants';
import type { GuardConfig } from '~guards';
import { isDescriber, isString } from '~types';
import { defaultReturn } from '~utils';
import { reduceFnMap } from './reduceFnMap';
import type { _ToPredicateF, ToPredicate_F } from './types';

export const returnTrue = () => {
  console.log(`${DEFAULT_NOTHING} call true`);
  return true;
};

export const returnFalse = () => {
  console.log(`${DEFAULT_NOTHING} call false`);
  return false;
};

const _toPredicate: _ToPredicateF = ({
  mode,
  guard,
  predicates,
  events,
}) => {
  const strict = mode !== 'normal';

  const out = (error: Error, _return?: any) => {
    return defaultReturn({
      config: {
        strict,
        value: returnTrue,
      },
      _return,
      error,
    });
  };

  if (!guard) return out(ERRORS.guard.notDefined.error);

  if (isDescriber(guard)) {
    const fn = predicates?.[guard.name];
    const func = fn ? reduceFnMap({ events, fn }) : undefined;
    return out(ERRORS.guard.notDescribed.error, func);
  }

  if (isString(guard)) {
    const fn = predicates?.[guard];
    const func = fn ? reduceFnMap({ events, fn }) : undefined;
    return out(ERRORS.guard.notProvided.error, func);
  }

  const makeArray = (guards: GuardConfig[]) => {
    return guards.map(guard =>
      _toPredicate({
        events,
        guard,
        predicates,
        mode,
      }),
    );
  };

  if (GUARD_TYPE.and in guard) {
    const and = makeArray(guard.and);
    return { and };
  }

  const or = makeArray(guard.or);
  return { or };
};

export const toPredicate: ToPredicate_F = ({
  mode,
  guard,
  predicates,
  events,
}) => {
  const out1 = _toPredicate({ guard, predicates, events, mode });
  return recursive(out1);
};
