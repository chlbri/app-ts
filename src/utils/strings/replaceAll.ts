import { escapeRegExp } from './escapeRegExp';

export type ReplaceAll_F = (params: {
  entry: string;
  match: string;
  replacement: string;
}) => string;

export const replaceAll: ReplaceAll_F = ({
  entry,
  match,
  replacement,
}) => {
  const regex = escapeRegExp(match);

  return entry.replace(new RegExp(regex, 'g'), () => replacement);
};
