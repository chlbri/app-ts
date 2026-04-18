#!/usr/bin/env node
import { cli } from './cli';
import { run } from 'cmd-ts';

run(cli, process.argv.slice(2));
