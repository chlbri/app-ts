import { subcommands } from 'cmd-ts';
import { generate } from './commands/generate';
import { watch } from './commands/watch';
import { BIN } from './constants';

export const cli = subcommands({
  name: BIN,
  description: 'CLI tool for @bemedev/app-ts type generation',
  cmds: {
    generate,
    watch,
  },
});
