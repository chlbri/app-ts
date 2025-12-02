import { Subject } from 'rxjs/internal/Subject';
import { EMPTY } from 'rxjs/internal/observable/empty';
import { scan } from 'rxjs/internal/operators/scan';
import { startWith } from 'rxjs/internal/operators/startWith';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { Observable, type Observer } from 'rxjs';

type SubArgs<T> = Partial<Observer<T>> | ((value: T) => void);

export const createPausable = <T>(
  source$: Observable<T>,
  observer?: SubArgs<T>,
) => {
  // Control Subject for start, stop, pause, and resume
  const control$ = new Subject<'start' | 'stop' | 'pause' | 'resume'>();

  // State management for the observable
  const controlled$ = control$.pipe(
    startWith('stop'), // Start in "stopped" state
    scan((state, action) => {
      if (action === 'start' && state !== 'running') return 'running';
      if (action === 'stop') return 'stopped';
      if (action === 'pause' && state === 'running') return 'paused';
      if (action === 'resume' && state === 'paused') return 'running';
      return state; // Ignore invalid transitions
    }, 'stopped'),
    switchMap(state => {
      if (state === 'running') return source$; // Emit values when running
      return EMPTY; // Emit nothing when paused or stopped
    }),
  );

  // Subscribe to the controlled Observable
  controlled$.subscribe(observer);

  return {
    start: () => control$.next('start'),
    stop: () => control$.next('stop'),
    pause: () => control$.next('pause'),
    resume: () => control$.next('resume'),
    command: (action: 'start' | 'stop' | 'pause' | 'resume') =>
      control$.next(action),
  };
};
