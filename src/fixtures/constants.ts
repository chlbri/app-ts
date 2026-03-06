export const defaultC = { pContext: {}, context: {} } as const;
export const defaultT = {
  ...defaultC,
  eventsMap: {},
  actorsMap: {
    children: {},
    emitters: {},
    promisees: {},
  },
} as const;
