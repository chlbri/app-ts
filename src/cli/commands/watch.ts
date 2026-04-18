import { command, option, string, multioption, array } from 'cmd-ts';
import { watch as chokidarWatch } from 'chokidar';
import { generateAppGen } from '../core/generator';
import {
  DEFAULT_OUTPUT,
  DEFAULT_EXCLUDES,
  MACHINE_GLOB,
} from '../constants';

export const watch = command({
  name: 'watch',
  description:
    'Watch *.machine.ts / *.fsm.ts files and regenerate app.gen.ts on change',
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
  },
  handler: async ({ output, excludes }) => {
    const cwd = process.cwd();

    // Initial generation
    generateAppGen({ output, excludes, cwd });

    // Watch for changes
    const watcher = chokidarWatch(MACHINE_GLOB, {
      cwd,
      ignored: excludes.map(e => `${e}/**`),
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 300,
        pollInterval: 100,
      },
    });

    const regenerate = (path: string) => {
      console.log(`\nChange detected: ${path}`);
      generateAppGen({ output, excludes, cwd });
    };

    watcher
      .on('add', regenerate)
      .on('change', regenerate)
      .on('unlink', regenerate);

    console.log(`\nWatching for changes in ${MACHINE_GLOB}...`);
    console.log('Press Ctrl+C to stop.\n');

    // Keep process alive
    process.on('SIGINT', () => {
      watcher.close();
      process.exit(0);
    });
  },
});
