export const buildInvite = (invite: string, index: number) => {
  const _index = index > 10 ? '0' + index : `${index}`;
  return `#${_index} => ${invite}`;
};
