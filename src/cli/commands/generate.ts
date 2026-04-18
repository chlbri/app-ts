import { command, option, string, multioption, array, flag } from 'cmd-ts';
import { generateAppGen } from '../core/generator';
import { DEFAULT_OUTPUT, DEFAULT_EXCLUDES } from '../constants';

export const generate = command({
  name: 'generate',
  description:
    'Generate app.gen.ts from all *.machine.ts / *.fsm.ts files',
  args: {
    output: option({
      type: string,
      long: 'output',
      short: 'o',
      defaultValue: () => DEFAULT_OUTPUT,
      description: 'Output file path (relative to project root)',
    }),
    excludes: multioption({
      type: array(string),
      long: 'excludes',
      short: 'e',
      defaultValue: () => DEFAULT_EXCLUDES,
      description: 'Directories to exclude',
    }),
    dryRun: flag({
      long: 'dry-run',
      description: 'Print output without writing to file',
    }),
  },
  handler: async ({ output, excludes, dryRun }) => {
    generateAppGen({ output, excludes, dryRun });
  },
});
