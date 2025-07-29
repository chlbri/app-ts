export type GetChildren_F = (str: string, ...keys: string[]) => string[];

/**
 * Returns an array of keys that are included the given string, excluding the string itself.
 * @param str - The string to check against.
 * @param keys - The keys to check.
 * @returns An array of keys that include the given string, excluding the string itself.
 */
export const getChildren: GetChildren_F = (str, ...keys) => {
  const noKeys = keys.length > 0;
  const out: string[] = [];
  if (noKeys) {
    keys.forEach(key => {
      const notMatch = str !== key;
      const check3 = key.startsWith(str);

      const check4 = notMatch && check3;
      if (check4) {
        out.push(key);
      }
    });
  }

  return out;
};
