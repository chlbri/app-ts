import { type Observable } from 'rxjs';
import { tap } from 'rxjs/internal/operators/tap';

export function tapWhile<T>(
  predicate: (value: T) => boolean,
  sideEffect: (value: T) => void,
) {
  return (source: Observable<T>) =>
    source.pipe(
      tap(value => {
        if (predicate(value)) {
          sideEffect(value);
        }
      }),
    );
}
