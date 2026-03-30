export const defaultC = {
  pContext: undefined,
  context: undefined,
} as const;
export const defaultT = {
  ...defaultC,
  eventsMap: {},
  actorsMap: {
    children: {},
    promisees: {},
  },
} as const;
