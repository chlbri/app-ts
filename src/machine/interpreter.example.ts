import { setInterval } from 'node:timers/promises';

const interval = 100;
let nnow = Date.now();
for await (const startTime of setInterval(interval, (nnow += 100))) {
  const now = Date.now();
  console.log(now);
  if (now - startTime > 1000) break;
}
