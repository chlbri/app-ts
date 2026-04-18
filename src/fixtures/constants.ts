export const defaultC = {
  pContext: undefined,
  context: undefined,
} as const;

export const defaultT = {
  ...defaultC,
  eventsMap: {},
  actorsMap: {
    children: {},
    emitters: {},
  },
} as const;

/* v8 ignore next */
export const emptyFn = () => {};
