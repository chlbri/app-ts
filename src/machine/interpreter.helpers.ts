import { isDefined } from '@bemedev/basifun';
import sleep from '@bemedev/sleep';
import { deepmerge } from 'deepmerge-ts';
import type { PrimitiveObject } from '~types';
import type { Contexts, SleepContexts_F } from './interpreter.types';
import type { NodeConfigWithInitials, RecordS } from './types';

export const sleepContexts: SleepContexts_F = async ms => {
  await sleep(ms);
  return {};
};

export const sleepU = async (ms = 0) => {
  await sleep(ms);
  return undefined;
};

export const performRemaining = <
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
>(
  ...remains: (() => {
    result: Contexts<Pc, Tc>;
    target?: string;
  })[]
) => {
  const remaining = (): {
    target?: string;
    result: Contexts<Pc, Tc>;
  } => {
    let target: string | undefined = undefined;
    let result: Contexts<Pc, Tc> = {};

    remains
      .map(f => f())
      .forEach(remain => {
        target = remain.target;
        result = deepmerge(result, remain.result) as any;
      });

    return { target, result };
  };

  return remaining;
};

export const possibleEvents = (flat: RecordS<NodeConfigWithInitials>) => {
  const events: string[] = [];

  const values = Object.values(flat);
  values.forEach(value => {
    const on = value.on;
    const check = isDefined(on);

    if (check) {
      events.push(...Object.keys(on));
    }
  });

  return events;
};
