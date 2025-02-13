import {
  type TimeoutPromise,
  type TypeFromTimeouts,
  withTimeout,
} from './withTimeout';

export type RacePromises_F = <T extends TimeoutPromise<any>[]>(
  id: string,
  ..._promises: T
) => TimeoutPromise<TypeFromTimeouts<T>>;

export const racePromises: RacePromises_F = (id, ..._promises) => {
  const _finally = () => {
    return _promises.forEach(({ abort }) => {
      return abort();
    });
  };

  const promises = _promises.map(promise => promise());
  const out = withTimeout(
    () => Promise.race(promises).finally(_finally),
    id,
  );

  return out;
};
