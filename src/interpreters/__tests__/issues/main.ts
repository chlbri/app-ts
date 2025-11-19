import { interpret } from '#interpreter';
import { machine } from './main.machine';

export const buildService = () =>
  interpret(machine, {
    context: {
      nodes: [],
      edges: [],
      edge: undefined,
    },
    pContext: {
      mount: {},
    },
  });
