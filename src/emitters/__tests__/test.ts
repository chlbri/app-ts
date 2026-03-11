import { createPausable } from '@bemedev/rx-pausable';
import { Subject } from 'rxjs';
import { createSequence } from '@bemedev/sequence';

const sub = new Subject<number>();
const DELAY = 350;
const pausable = createPausable(sub, {
  next: value => {
    console.warn('Next received in subject subscription:', value);
  },
  error: value => {
    console.warn('Error received in subject subscription:', value);
  },
  complete: () => console.warn('Subject completed'),
});

createSequence()
  .add(0, pausable.start)
  .add(DELAY, () => sub.next(1))
  .add(DELAY, () => sub.next(2))
  .add(DELAY, () => sub.error('Test error'))
  .add(DELAY, () => sub.next(3))
  .add(DELAY, () => sub.complete())
  .run();

// pausable.start();
// sub.next(1);

// setTimeout(() => {
//   sub.next(2);
// }, DELAY);

// // setTimeout(() => {
// //   sub.error('Test error');
// // }, DELAY * 2);

// setTimeout(() => {
//   sub.next(2);
// }, DELAY * 4);

// setTimeout(() => {
//   sub.complete();
// }, DELAY * 5);
