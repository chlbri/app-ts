import { interval, take, map, type Subscription } from 'rxjs';

const func = () => {
  const int = interval(200).pipe(
    take(5),
    map(v => v + 1),
    map(v => v * 5),
  );

  let sub: Subscription | undefined;

  const out = {
    start: () => {
      sub = int.subscribe(console.log);
    },
    stop: () => {
      return sub?.unsubscribe();
    },
  };

  return out;
};

const out = func();

out.start();

setTimeout(() => {
  out.stop();
}, 500);

setTimeout(() => {
  out.start();
}, 1500);
