import { createMachine } from '#machine';
import { typings } from '#utils';
import type { inferT } from 'src/utils/typings';
import { SCHEMAS } from './machine1.machine.gen';
import { asset, intermediary } from './machine1.machine.typings';

export const BLOCK_IMMO_INTERMEDIARY: inferT<typeof intermediary> = {
  id: 'block-immo-001',
  wallet: '0xblockimmo123456',
  personality: 'company',
  companyName: 'Block Immo Services',
  registrationNumber: 'BLOCKIMMO-001',
  contacts: {
    phoneNumbers: [{ countryCode: +225, number: '0759260709' }],
    emails: ['contact@block-immo.fr'],
    websites: ['https://block-immo.fr'],
  },
};

export const machine = createMachine(
  {
    initial: 'idle',
    __tsSchema: SCHEMAS.machine.__tsSchema,
    states: {
      idle: {
        on: {
          START: [
            {
              target: '/checking',
              description: 'Start the machine',
              guards: { and: ['assetIsDefined', 'mandatoryIsDefined'] },
              actions: [
                'provideAsset',
                'addMandatoryIntermediary',
                {
                  name: 'addBlockImmoIntermediary',
                  description:
                    'BLOCK_IMMO is here the second intermediary',
                },
              ],
            },
            {
              target: '/checking',
              description: 'Start the machine',
              guards: 'assetIsDefined',
              actions: [
                'provideAsset',
                {
                  name: 'addBlockImmoIntermediary',
                  description: 'BLOCK_IMMO is the first intermediary',
                },
              ],
            },
            {
              actions: ['error.noAsset'],
            },
          ],
        },
      },
      checking: {
        promises: [
          {
            src: 'checkOnline',
            description: 'Check if we are online',
            then: {
              actions: 'setOnlineStatus',
            },
            catch: {
              target: '/idle',
              actions: 'setOnlineStatus',
            },
          },
          {
            src: 'getIntermediaries',
            description: 'Fetch intermediaries from the blockchain',
            then: {
              target: '/working',
              actions: 'addIntermediaries',
            },
            catch: {
              target: '/idle',
              actions: {
                name: 'error.fetchIntermediaries',
                description: 'Failed to fetch intermediaries',
              },
            },
          },
        ],
      },
      working: {
        initial: 'idle',
        states: {
          idle: {
            on: {
              RESET: {
                target: '/idle',
                actions: ['reset'],
              },
              ADD_INTERMEDIARY: [
                {
                  description: 'Add an intermediary',
                  guards: {
                    and: [
                      {
                        name: 'intermediariesAreNotFull',
                        description: 'Max 3/5/7 intermediaries',
                      },
                      'intermediaryIsNotAdded',
                    ],
                  },
                  target: '/working/adding',
                },
                {
                  actions: ['error.addIntermediary'],
                },
              ],
            },
          },
          adding: {
            promises: [
              {
                src: 'checkOnline',
                description: 'Check if we are online',
                then: {
                  actions: 'setOnlineStatus',
                },
                catch: {
                  target: '/working/idle',
                  actions: 'setOnlineStatus',
                },
              },
              {
                src: 'addIntermediary',
                description: 'Add the intermediary to the blockchain',
                then: {
                  target: '/working/idle',
                  actions: ['addIntermediary', 'end.add'],
                },
                catch: {
                  target: '/idle',
                  actions: [
                    {
                      name: 'error.online.addIntermediary',
                      description: 'Failed to add the intermediary',
                    },

                    'end.error.add',
                  ],
                },
                max: 'MAX_MUTATE',
              },
            ],
          },
        },
      },
    },
  },
  typings({
    eventsMap: {
      START: typings.partial({
        asset,
        mandatory: intermediary,
      }),
      ADD_INTERMEDIARY: intermediary,
      RESET: 'primitive',
    },
    context: typings.partial({
      asset,
      intermediaries: typings.array(intermediary),
      internetStatus: 'boolean',
      errors: typings.partial({
        noAsset: 'string',
        fetchIntermediaries: 'string',
        intermediary: {
          offline: 'string',
          online: 'string',
        },
      }),
    }),
    promiseesMap: {
      checkOnline: {
        then: 'boolean',
        catch: 'boolean',
      },
      getIntermediaries: {
        then: [intermediary],
        catch: [],
      },
      addIntermediary: {
        then: intermediary,
        catch: 'undefined',
      },
    },
  }),
).provideOptions(({ assign, erase, batch }) => ({
  actions: {
    provideAsset: assign('context.asset', {
      START: ({ payload }) => payload.asset,
    }),

    reset: batch(
      erase('context.asset'),
      erase('context.intermediaries'),
      erase('context.internetStatus'),
      erase('context.errors'),
    ),

    addMandatoryIntermediary: assign('context.intermediaries', {
      START: ({ payload }) => [payload.mandatory!],
    }),

    addBlockImmoIntermediary: assign('context.intermediaries', {
      START: ({ context: { intermediaries = [] } }) => [
        ...intermediaries,
        BLOCK_IMMO_INTERMEDIARY,
      ],
    }),

    'error.noAsset': assign(
      'context.errors.noAsset',
      () => 'Asset is required to start the machine',
    ),

    setOnlineStatus: assign('context.internetStatus', {
      'checkOnline::then': ({ payload }) => payload,
      'checkOnline::catch': ({ payload }) => payload,
    }),

    addIntermediaries: assign('context.intermediaries', {
      'getIntermediaries::then': ({
        payload,
        context: { intermediaries = [] },
      }) => [...intermediaries, ...payload],
    }),

    'error.fetchIntermediaries': assign(
      'context.errors.fetchIntermediaries',
      () => 'Failed to fetch intermediaries',
    ),

    'error.addIntermediary': assign(
      'context.errors.intermediary.offline',
      () => 'Cannot add this intermediary',
    ),

    addIntermediary: assign('context.intermediaries', {
      'addIntermediary::then': ({
        payload,
        context: { intermediaries = [] },
      }) => [...intermediaries, payload],
    }),

    'error.online.addIntermediary': assign(
      'context.errors.intermediary.online',
      () => 'Failed to add the intermediary due to online issue',
    ),
  },

  predicates: {
    assetIsDefined: {
      START: ({ payload }) => !!payload.asset,
    },

    mandatoryIsDefined: {
      START: ({ payload }) => !!payload.mandatory,
    },

    intermediariesAreNotFull: ({
      context: { asset, intermediaries = [] },
    }) => {
      const value = asset!.value;
      const max = value > 30_000_000 ? 7 : value > 3_000_000 ? 5 : 3;

      return intermediaries.length < max;
    },
    intermediaryIsNotAdded: {
      ADD_INTERMEDIARY: ({
        context: { intermediaries = [] },
        payload,
      }) => {
        const check =
          payload &&
          !intermediaries.some(
            intermediary => intermediary.id === payload.id,
          );
        return check;
      },
    },
  },
  delays: {
    MAX_MUTATE: 1000,
  },
}));
