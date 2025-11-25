import { SCHEMAS } from './main.machine.gen';
import {
  EDGE_RADIUS,
  INTIAL_NODE,
  PARENT_CHILD_GAP_WIDTH,
  SIBLING_GAP_HEIGHT,
} from './main.data';
import { createMachine } from '#machine';
import { typings } from '#utils';

export const machine = createMachine(
  {
    __tsSchema: SCHEMAS.machine.__tsSchema,
    initial: 'idle',
    states: {
      idle: {
        on: {
          CONFIGURE: {
            actions: ['addInitialNodes', 'addInitialEdges'],
            target: '/preparation',
          },
        },
        // always: '/preparation',
      },

      preparation: {
        on: {
          MOUNT: '/working',
        },
      },

      working: {
        type: 'parallel',
        states: {
          mounting: {
            initial: 'idle',
            states: {
              idle: {
                on: { MOUNT: '/working/mounting/mounting' },
              },
              mounting: {
                always: {
                  actions: [
                    'mount',
                    {
                      name: 'updateMount',
                      description:
                        'Update after getting board dimensions, will be given by the view',
                    },
                  ],
                  target: '/working/mounting/idle',
                },
              },
            },
          },
          base: {
            on: {
              MOUNT: {
                actions: [
                  'mount',
                  {
                    name: 'updateMount',
                    description:
                      'Update after getting board dimensions, will be given by the view',
                  },
                ],
              },
              ADD_CHILD: {
                actions: ['addChild', 'notifyNodeAdded'],
              },

              ADD_SIBLING: {
                actions: ['addSibling', 'notifySiblingAdded'],
              },

              DELETE_NODE: {
                actions: ['deleteNode', 'notifyNodeDeleted'],
              },

              START_EDGE: {
                actions: ['startEdge'],
              },

              END_EDGE: {
                actions: ['endEdge'],
              },

              ADD_EDGE: {
                guards: 'edgeStarted',
                actions: ['addEdge', 'notifyEdgeAdded'],
              },

              DELETE_EDGE: {
                actions: ['deleteEdge', 'notifyEdgeDeleted'],
              },

              SELECT: {
                actions: ['select'],
              },

              DESELECT: {
                actions: ['deselect'],
              },
            },
          },
        },
      },
    },
  },
  typings({
    eventsMap: {
      MOUNT: {
        id: 'string',
        width: 'number',
        height: 'number',
        input: typings.partial({
          x: 'number',
          y: 'number',
        }),
        output: {
          x: 'number',
          y: 'number',
        },
      },
      ADD_CHILD: 'string',
      ADD_SIBLING: 'string',
      DELETE_NODE: 'string',
      DELETE_EDGE: 'string',
      CONFIGURE: typings.partial({
        nodes: [
          {
            id: 'string',
            x: 'number',
            y: 'number',

            label: 'string',
            content: typings.maybe('primitive'),
          },
        ],
        edges: [
          {
            from: 'string',
            to: 'string',
            id: 'string',
            position: {
              x0: 'number',
              y0: 'number',
              x1: 'number',
              y1: 'number',
            },
          },
        ],
      }),
      ADD_EDGE: {
        from: 'string',
        to: 'string',
      },
      SELECT: 'string',
      DESELECT: 'primitive',

      START_EDGE: 'string',
      END_EDGE: 'primitive',
    },
    pContext: {
      mount: typings.record(
        typings.intersection(
          {
            width: 'number',
            height: 'number',
          },
          typings.record(
            {
              x: 'number',
              y: 'number',
            },
            'input',
            'output',
          ),
        ),
      ),
    },
    context: {
      edge: typings.maybe('string'),
      edges: [
        {
          id: 'string',
          from: 'string',
          to: 'string',
          active: 'boolean',
          selected: 'boolean',
          position: {
            x0: 'number',
            y0: 'number',
            x1: 'number',
            y1: 'number',
          },
        },
      ],
      nodes: [
        {
          id: 'string',
          position: {
            x: 'number',
            y: 'number',
          },
          selected: 'boolean',
          label: 'string',
          content: 'primitive',
          input: 'boolean',
        },
      ],
    },
  }),
).provideOptions(({ assign, batch, voidAction, erase }) => ({
  actions: {
    mount: assign('pContext.mount', {
      MOUNT: ({ pContext: { mount }, payload: { id, ...rest } }) => ({
        ...mount,
        [id]: rest,
      }),
    }),

    addInitialEdges: assign('context.edges', {
      CONFIGURE: ({ payload }) =>
        payload.edges?.map(edge => ({
          ...edge,
          active: true,
        })),
    }),

    addInitialNodes: assign('context.nodes', {
      CONFIGURE: ({ payload }) =>
        payload.nodes?.map(node => ({ ...node, selected: false })) ?? [
          INTIAL_NODE,
        ],
    }),

    addChild: batch(
      assign('context.edges', {
        ADD_CHILD: ({
          context: { edges, nodes },
          payload: from,
          pContext: { mount },
        }) => {
          const len = edges.length;
          const to = `node-${nodes.length}`;
          const id = `#${len}=(${from})->(${to})`;

          const output = mount[from].output;
          const input = {
            x: output.x + PARENT_CHILD_GAP_WIDTH - 26 + EDGE_RADIUS,
            y: output.y,
          };

          const newEdge = {
            id,
            from,
            to,
            active: false,
            selected: false,
            position: {
              x0: output.x,
              y0: output.y,
              x1: input.x,
              y1: input.y,
            },
          };

          return [...edges, newEdge];
        },
      }),
      assign('context.nodes', {
        ADD_CHILD: ({
          context: { nodes },
          payload,
          pContext: { mount },
        }) => {
          const from = nodes.find(n => n.id === payload)!;
          const width = mount[payload].width;
          const height = mount[payload].height;

          const x = from.position.x + width + PARENT_CHILD_GAP_WIDTH;
          const y = from.position.y - height;

          const newNode = {
            id: `node-${nodes.length}`,
            position: { x, y },
            selected: true,
            label: `Node ${nodes.length}`,
            content: `This is node ${nodes.length}`,
            input: true,
          };

          const out = nodes.map(node => ({
            ...node,
            selected: false,
          }));

          out.push(newNode);

          return out;
        },
      }),
    ),

    addSibling: batch(
      assign('context.edges', {
        ADD_SIBLING: ({ context: { edges, nodes }, payload: payload }) => {
          const from = edges.find(e => e.to === payload);
          const to = `node-${nodes.length}`;
          const id = `#${edges.length}=(${from})->(${to})`;

          const newEdge = {
            id,
            from,
            to,
            active: false,
            selected: false,
            position: {
              x0: 0,
              y0: 0,
              x1: 0,
              y1: 0,
            },
          };

          return [...edges, newEdge];
        },
      }),

      assign('context.nodes', {
        ADD_SIBLING: ({
          context: { nodes, edges },
          payload,
          pContext: { mount },
        }) => {
          const fromId = edges.find(e => e.to === payload)!.from;
          const width = mount[fromId].width;
          const from = nodes.find(n => n.id === fromId)!;

          const x = from.position.x + width + PARENT_CHILD_GAP_WIDTH;
          const y = from.position.y + SIBLING_GAP_HEIGHT;

          const newNode = {
            id: `node-${nodes.length}`,
            position: { x, y },
            selected: true,
            label: `Node ${nodes.length}`,
            content: `This is node ${nodes.length}`,
          };

          return [...nodes, newNode];
        },
      }),
    ),

    addEdge: assign('context.edges', {
      ADD_EDGE: ({
        context: { edges },
        payload: { from, to },
        pContext: { mount },
      }) => {
        const input = mount[to].input;
        const output = mount[from].output;
        const newEdge = {
          id: `#${edges.length}=(${from})->(${to})`,
          from,
          to,
          active: true,
          selected: false,
          position: {
            x0: output.x,
            y0: output.y,
            x1: input.x,
            y1: input.y,
          },
        };

        return [...edges, newEdge];
      },
    }),

    deleteEdge: assign('context.edges', {
      DELETE_EDGE: ({ context: { edges }, payload }) =>
        edges.filter(edge => edge.id !== payload),
    }),

    deleteNode: batch(
      assign('context.edges', {
        DELETE_NODE: ({ context: { edges }, payload }) =>
          edges.filter(
            edge => edge.from !== payload && edge.to !== payload,
          ),
      }),
      assign('context.nodes', {
        DELETE_NODE: ({ context: { nodes }, payload }) =>
          nodes.filter(node => node.id !== payload),
      }),
    ),

    notifyEdgeAdded: voidAction({
      ADD_EDGE: ({ payload: { from, to } }) => {
        console.log(`Edge added between ${from} and ${to}`);
      },
    }),

    notifyEdgeDeleted: voidAction({
      DELETE_EDGE: ({ payload }) => {
        console.log(`Edge with id ${payload} deleted`);
      },
    }),

    notifyNodeAdded: voidAction({
      ADD_CHILD: ({ payload, context: { nodes } }) => {
        console.log(
          `Node ${payload} has a new child node node-${nodes.length - 1}`,
        );
      },
    }),

    notifySiblingAdded: voidAction({
      ADD_SIBLING: ({ payload, context: { nodes } }) => {
        console.log(
          `Node ${payload} has a new sibling node node-${nodes.length - 1}`,
        );
      },
    }),

    notifyNodeDeleted: voidAction({
      DELETE_NODE: ({ payload }) => {
        console.log(`Node with id ${payload} is deleted`);
      },
    }),

    deselect: batch(
      assign('context.nodes', {
        DESELECT: ({ context: { nodes } }) =>
          nodes.map(node => ({ ...node, selected: false })),
      }),
      assign('context.edges', {
        DESELECT: ({ context: { edges } }) =>
          edges.map(edge => ({ ...edge, selected: false })),
      }),
    ),

    select: batch(
      assign('context.edges', {
        SELECT: ({ context: { edges }, payload }) =>
          edges.map(edge => ({
            ...edge,
            selected: edge.id === payload,
          })),
      }),
      assign('context.nodes', {
        SELECT: ({ context: { nodes }, payload }) =>
          nodes.map(node => ({
            ...node,
            selected: node.id === payload,
          })),
      }),
    ),

    startEdge: assign('context.edge', {
      START_EDGE: ({ payload }) => payload,
    }),

    endEdge: erase('context.edge'),
  },
  predicates: {
    edgeStarted: ({ context: { edge } }) => !!edge,
  },
}));
