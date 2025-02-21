export interface TimeoutPromise<T = any> {
  (): Promise<T>;
  abort: () => void;
  id: string;
}

export type TypeFromTimeout<T extends TimeoutPromise> =
  T extends TimeoutPromise<infer U> ? U : never;

export type TypeFromTimeouts<T extends TimeoutPromise[]> = TypeFromTimeout<
  T[number]
>;

export const withTimeout = <T = any>(
  promise: () => Promise<T>,
  id: string,
  ..._timeouts: number[]
): TimeoutPromise<T> => {
  const timeouts = [..._timeouts, 1_000_000];

  const timeoutPids = Array.from(
    { length: timeouts.length },
    () => undefined as NodeJS.Timeout | undefined,
  );

  const controller = new AbortController();

  const timeoutPromises = timeouts.map((millis, i) => {
    return new Promise((_, reject) => {
      controller.signal.addEventListener('abort', () => {
        reject('Aborted.');
      });

      return (timeoutPids[i] = setTimeout(
        () => reject(`Timed out after ${millis} ms.`),
        millis,
      ));
    });
  });

  const out = () =>
    Promise.race([promise(), ...timeoutPromises]).finally(() => {
      timeoutPids.forEach(pid => {
        if (pid) {
          clearTimeout(pid);
        }
      });
    }) as any;

  out.abort = () => controller.abort();
  out.id = id;

  return out;
};
