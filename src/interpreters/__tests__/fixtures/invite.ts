const log10 = (index = 0) => {
  if (index === 0) return 0;
  const log = Math.trunc(Math.log10(index));
  return log;
};

export const buildIndex = (index = 0, max = 0) => {
  if (index < 0 || max < 0) {
    throw new Error(
      `index (${index}) and max (${max}) must be positive integers`,
    );
  }

  if (index > max) {
    throw new Error(
      `index (${index}) must be less than or equal to max (${max})`,
    );
  }

  const logIndex = log10(index);
  const logMax = log10(max);
  const length = logMax - logIndex;
  const zeros = '0'.repeat(length);
  return `${zeros}${index}`;
};

export const buildInvite = (invite: string, index = 0, max = 0) => {
  const _index = buildIndex(index, max);
  return `#${_index} => ${invite}`;
};
