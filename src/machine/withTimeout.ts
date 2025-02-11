export const withTimeout = <T = any>(
  promise: () => Promise<T>,
  ...timeouts: number[]
): (() => Promise<T>) => {
  const timeoutPids = Array.from(
    { length: timeouts.length },
    () => undefined as NodeJS.Timeout | undefined,
  );

  const timeoutPromises = timeouts.map((millis, i) => {
    return new Promise((_, reject) => {
      return (timeoutPids[i] = setTimeout(
        () => reject(`Timed out after ${millis} ms.`),
        millis,
      ));
    });
  });

  return () =>
    Promise.race([promise(), ...timeoutPromises]).finally(() => {
      timeoutPids.forEach(pid => {
        if (pid) {
          clearTimeout(pid);
        }
      });
    }) as any;
};
