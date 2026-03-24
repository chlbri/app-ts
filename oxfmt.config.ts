import { defineConfig } from 'oxfmt';

export default defineConfig({
  arrowParens: 'avoid',
  bracketSpacing: true,
  endOfLine: 'lf',
  htmlWhitespaceSensitivity: 'css',
  bracketSameLine: false,
  printWidth: 75,
  proseWrap: 'always',
  requirePragma: false,
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'all',
  useTabs: false,
  vueIndentScriptAndStyle: true,
  sortPackageJson: false,
  ignorePatterns: ['node_modules', 'publish', 'publish_npm', 'lib'],
});
