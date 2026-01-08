import { interval, map } from 'rxjs';
import { createPausable } from '../functions';

const { start, resume, pause, stop } = createPausable(
  interval(100).pipe(map(v => v + 1)),
  value => console.log('value', '=>', value),
);

// Simulate start, pause, resume, and stop
console.log('Starting...');
setTimeout(() => {
  console.log('Start');
  start(); // Start the observable
}, 100);

setTimeout(() => {
  console.log('Pause');
  pause(); // Pause after 500 ms
}, 500);

setTimeout(() => {
  console.log('Resume');
  resume(); // Resume after 1 second
}, 1000);

setTimeout(() => {
  console.log('Stop');
  stop(); // Stop after 2 seconds
}, 2050);
